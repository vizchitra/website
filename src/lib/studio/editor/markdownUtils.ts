/**
 * Markdown ↔ ProseMirror bridge for the Studio editor.
 *
 * Uses the same remark pipeline as the build (remarkParse + remarkGfm +
 * remarkDirective) so editor parse/serialize output is guaranteed identical
 * to what content-collections produces — no parser mismatch bugs.
 *
 * PARSE  (markdown string → ProseMirror doc):
 *   unified().use(remarkParse).use(remarkGfm).use(remarkDirective)
 *            .use(remarkProseMirror, { schema, handlers })
 *            .processSync(text)  → file.result as Node
 *
 * SERIALIZE (ProseMirror doc → markdown string):
 *   fromProseMirror(doc, { schema, nodeHandlers, markHandlers }) → mdast
 *   unified().use(remarkStringify).use(remarkGfm).use(remarkDirective)
 *            .stringify(mdast)  → string
 *
 * Directive nodes:
 *   - containerDirective "notice" ↔ block_directive PM node (editable children)
 *   - textDirective "slanted"     ↔ slanted PM mark (label = marked text)
 *   - leafDirective               ↔ leaf_directive PM atom node (future use)
 *
 * Note: remarkVizchitraDirectives is intentionally NOT included here.
 * That plugin applies render-time hast transforms (per-letter spans etc.)
 * that must NOT affect editor state.
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import {
	remarkProseMirror,
	toPmNode,
	toPmMark,
	fromProseMirror,
	fromPmNode,
	fromPmMark
} from '@handlewithcare/remark-prosemirror';
import type {
	RemarkProseMirrorOptions,
	FromProseMirrorOptions
} from '@handlewithcare/remark-prosemirror';
import type { Node as PmNode, Mark as PmMark } from 'prosemirror-model';
import type { Nodes as MdastNodes } from 'mdast';
import { editorSchema as schema } from './editorSchema';

// ── Types ─────────────────────────────────────────────────────────────────

// remark-directive extends mdast with containerDirective / textDirective /
// leafDirective node types that are not in the base @types/mdast.
// We use `unknown` narrowing at the handler boundary rather than `any`.
type DirectiveNode = {
	type: string;
	name: string;
	attributes?: Record<string, string>;
	children?: unknown[];
};

// ── Parse handlers (mdast → ProseMirror) ─────────────────────────────────

/**
 * Handlers passed to remarkProseMirror.
 *
 * Standard mdast types are typed via the library's helpers.
 * Directive types (containerDirective, textDirective, leafDirective) are
 * extension nodes added by remark-directive — typed as `unknown` then
 * narrowed, since they are not part of base @types/mdast.
 */
const parseHandlers: RemarkProseMirrorOptions['handlers'] & Record<string, unknown> = {
	// ── Block nodes ────────────────────────────────────────────────────────
	paragraph: toPmNode(schema.nodes.paragraph),
	heading: toPmNode(schema.nodes.heading, (node) => ({ level: (node as { depth: number }).depth })),
	blockquote: toPmNode(schema.nodes.blockquote),
	thematicBreak: toPmNode(schema.nodes.horizontal_rule),
	listItem: toPmNode(schema.nodes.list_item),

	list(node, _, state) {
		const n = node as unknown as { ordered: boolean; children: unknown[] };
		const nodeType = n.ordered ? schema.nodes.ordered_list : schema.nodes.bullet_list;
		return nodeType.createAndFill({}, state.all(node as MdastNodes)) ?? null;
	},

	code(node) {
		const n = node as unknown as { lang?: string | null; value: string };
		return schema.nodes.code_block.createAndFill(
			{ params: n.lang ?? '' },
			n.value ? [schema.text(n.value)] : []
		);
	},

	image(node) {
		const n = node as unknown as { url: string; alt?: string | null; title?: string | null };
		return schema.nodes.image.createAndFill({
			src: n.url,
			alt: n.alt ?? '',
			title: n.title ?? null
		});
	},

	break: () => schema.nodes.hard_break.create(),

	// ── Inline marks ───────────────────────────────────────────────────────
	emphasis: toPmMark(schema.marks.em),
	strong: toPmMark(schema.marks.strong),

	link: toPmMark(schema.marks.link, (node) => ({
		href: (node as unknown as { url: string; title?: string | null }).url,
		title: (node as unknown as { url: string; title?: string | null }).title ?? null
	})),

	// inlineCode is a leaf mdast node, not a parent — produce a text node with code mark
	inlineCode(node) {
		const value = (node as unknown as { value: string }).value;
		return [schema.text(value).mark([schema.marks.code.create()])];
	},

	// ── Tables (prosemirror-tables) ────────────────────────────────────────
	// Handle the entire table at once to track header row (first row).
	// remark-gfm puts all rows in `children`; first = header row.
	table(node, _, state) {
		const rows = (node as unknown as { children: { children: unknown[] }[] }).children.map(
			(row, rowIndex) => {
				const isHeader = rowIndex === 0;
				const cells = row.children.map((cell) => {
					const content = state.all(cell as MdastNodes) as PmNode[];
					// Cell content must be block-level; wrap inline nodes in a paragraph
					const blockContent =
						content.length > 0 && content[0]?.isInline
							? [
									schema.nodes.paragraph.createAndFill({}, content) ??
										(schema.nodes.paragraph.createAndFill() as PmNode)
								]
							: content.length > 0
								? content
								: [schema.nodes.paragraph.createAndFill() as PmNode];
					const cellType = isHeader ? schema.nodes.table_header : schema.nodes.table_cell;
					return cellType.createAndFill({}, blockContent);
				});
				return schema.nodes.table_row.createAndFill({}, cells.filter(Boolean));
			}
		);
		return schema.nodes.table.createAndFill({}, rows.filter(Boolean));
	},

	// ── Directives ─────────────────────────────────────────────────────────

	// :::notice … ::: → block_directive node with editable prose children
	containerDirective(node, _, state) {
		const d = node as unknown as DirectiveNode;
		const children = state.all(node as MdastNodes) as PmNode[];
		return schema.nodes.block_directive.createAndFill(
			{ name: d.name },
			children.length ? children : [schema.nodes.paragraph.createAndFill() as PmNode]
		);
	},

	// :slanted[text] → slanted mark applied to the directive's text children
	textDirective(node, _, state) {
		const d = node as unknown as DirectiveNode;
		if (d.name !== 'slanted') {
			// Unknown text directive: fall back to plain text to avoid data loss
			return state.all(node as MdastNodes) as PmNode[];
		}
		const content = state.all(node as MdastNodes) as PmNode[];
		return content.map((n) => (n.isText ? n.mark([...n.marks, schema.marks.slanted.create()]) : n));
	},

	// ::name[label]{attrs} → leaf_directive atom node
	leafDirective(node) {
		const d = node as unknown as DirectiveNode;
		const label = (d.children ?? []).map((c) => (c as { value?: string }).value ?? '').join('');
		return schema.nodes.leaf_directive.createAndFill({
			name: d.name,
			label,
			attrs: JSON.stringify(d.attributes ?? {})
		});
	}
};

// ── Serialize handlers (ProseMirror → mdast) ──────────────────────────────

const nodeHandlers: FromProseMirrorOptions<string, string>['nodeHandlers'] = {
	paragraph: fromPmNode('paragraph'),
	heading: fromPmNode('heading', (node) => ({ depth: node.attrs.level as 1 | 2 | 3 | 4 | 5 | 6 })),
	blockquote: fromPmNode('blockquote'),
	horizontal_rule: fromPmNode('thematicBreak'),
	ordered_list: fromPmNode('list', () => ({ ordered: true, spread: false })),
	bullet_list: fromPmNode('list', () => ({ ordered: false, spread: false })),
	list_item: fromPmNode('listItem', () => ({ spread: false })),

	code_block(node) {
		return {
			type: 'code',
			lang: (node.attrs.params as string) || null,
			meta: null,
			value: node.textContent
		} as MdastNodes;
	},

	image(node) {
		return {
			type: 'image',
			url: node.attrs.src as string,
			alt: (node.attrs.alt as string) ?? '',
			title: (node.attrs.title as string) || null
		} as MdastNodes;
	},

	hard_break: () => ({ type: 'break' }) as MdastNodes,

	// Tables → GFM mdast (remark-gfm stringifies these)
	table(node, _parent, state) {
		return { type: 'table', align: [], children: state.all(node) } as unknown as MdastNodes;
	},

	table_row(node, _parent, state) {
		return { type: 'tableRow', children: state.all(node) } as unknown as MdastNodes;
	},

	// Both table_cell and table_header map to mdast tableCell (GFM has no header-cell type)
	table_cell(node, _parent, state) {
		return { type: 'tableCell', children: state.all(node) } as unknown as MdastNodes;
	},

	table_header(node, _parent, state) {
		return { type: 'tableCell', children: state.all(node) } as unknown as MdastNodes;
	},

	// Directives
	block_directive(node, _parent, state) {
		return {
			type: 'containerDirective',
			name: node.attrs.name as string,
			attributes: {},
			children: state.all(node)
		} as unknown as MdastNodes;
	},

	leaf_directive(node) {
		const label = node.attrs.label as string;
		return {
			type: 'leafDirective',
			name: node.attrs.name as string,
			attributes: JSON.parse(node.attrs.attrs as string) as Record<string, string>,
			children: label ? [{ type: 'text', value: label }] : []
		} as unknown as MdastNodes;
	}
};

const markHandlers: FromProseMirrorOptions<string, string>['markHandlers'] = {
	em: fromPmMark('emphasis'),
	strong: fromPmMark('strong'),

	link: fromPmMark('link', (mark: PmMark) => ({
		url: mark.attrs.href as string,
		title: (mark.attrs.title as string) || null
	})),

	// `code` mark → mdast inlineCode leaf (no children — extract text directly)
	code(_mark: PmMark, _parent: PmNode, children: MdastNodes[]) {
		const value = children
			.map((c) => ('value' in c && typeof c.value === 'string' ? c.value : ''))
			.join('');
		return { type: 'inlineCode', value } as MdastNodes;
	},

	// `slanted` mark → textDirective (label = marked text content)
	slanted(_mark: PmMark, _parent: PmNode, children: MdastNodes[]) {
		return {
			type: 'textDirective',
			name: 'slanted',
			attributes: {},
			children
		} as unknown as MdastNodes;
	}
};

// ── Unified processors ────────────────────────────────────────────────────

/** Parse: markdown string → ProseMirror doc (synchronous). */
const parseProcessor = unified()
	.use(remarkParse)
	.use(remarkGfm)
	.use(remarkDirective)
	.use(remarkProseMirror, { schema, handlers: parseHandlers } as RemarkProseMirrorOptions);

/** Serialize: mdast root → markdown string (synchronous). */
const serializeProcessor = unified().use(remarkStringify).use(remarkGfm).use(remarkDirective); // adds directiveToMarkdown extension for :::, ::, :

// ── Public API ────────────────────────────────────────────────────────────

/** Parse a markdown string into a ProseMirror document. */
export function parseMarkdown(markdownText: string): PmNode {
	const file = parseProcessor.processSync(markdownText);
	return file.result as unknown as PmNode;
}

/** Serialize a ProseMirror document back to a markdown string. */
export function serializeMarkdown(doc: PmNode): string {
	const mdast = fromProseMirror(doc, { schema, nodeHandlers, markHandlers });
	// remark-stringify encodes trailing spaces as &#x20; to preserve them in
	// markdown round-trips, but trailing spaces are meaningless in TOML strings.
	return serializeProcessor.stringify(mdast).replace(/&#x20;/g, '');
}
