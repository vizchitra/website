<script lang="ts">
	import {
		Grid,
		Card,
		Button,
		DividerCurves,
		Header,
		Container,
		Cluster,
		Stack,
		Prose
	} from '$lib/components';
</script>

<Header title="Attendee Guide" banner="curve" />

<Container>
	<Stack>
		<!-- Welcome -->
		<Prose color="teal">
			<h1>Attendee Guide</h1>
			<p>
				Welcome to <strong>VizChitra 2026</strong>. This guide has everything you need to navigate
				the two days comfortably. We have been working on this edition for months and are thrilled
				to have you be part of it.
			</p>
			<p>
				Two days. Talks, dialogues, workshops, an exhibition, and a whole lot of community. Here is
				what you need to know.
			</p>
		</Prose>

		<!-- Schedule callout -->
		<Cluster justify="start">
			<Button href="/2026/schedule" color="orange">Go see the schedule &rarr;</Button>
		</Cluster>

		<!-- What this guide covers -->
		<Prose>
			<h2>What this guide covers</h2>
			<ul>
				<li><a href="/2026/attendee-guide#venue">Venue &amp; How to Get There</a></li>
				<li><a href="/2026/attendee-guide#whatsapp">Attendee WhatsApp Group</a></li>
				<li><a href="/2026/attendee-guide#registration">Registration</a></li>
				<li><a href="/2026/attendee-guide#food">Food &amp; Refreshments</a></li>
				<li><a href="/2026/attendee-guide#workshops">Workshops</a></li>
				<li><a href="/2026/attendee-guide#conduct">Code of Conduct</a></li>
				<li><a href="/2026/attendee-guide#accommodation">Accommodation</a></li>
			</ul>
		</Prose>

		<DividerCurves />

		<!-- Venue & Travel -->
		<Prose color="teal" id="venue">
			<h2>Venue &amp; How to Get There</h2>
			<p>
				Both days of VizChitra 2026 are at <strong>Bangalore International Centre (BIC)</strong>,
				the same venue as last year.
			</p>
		</Prose>

		<Grid minWidth="28ch" maxColumns={2} gap={6}>
			<Card variant="bordered" color="orange" title="Workshop Day // 3rd July 2026">
				<p>
					<strong>Bangalore International Centre (BIC)</strong><br />
					7, 4th Main Rd, Stage 2, Domlur,<br />
					Bengaluru, Karnataka 560071
				</p>
			</Card>
			<Card variant="bordered" color="teal" title="Conference Day // 4th July 2026">
				<p>
					<strong>Bangalore International Centre (BIC)</strong><br />
					7, 4th Main Rd, Stage 2, Domlur,<br />
					Bengaluru, Karnataka 560071
				</p>
			</Card>
		</Grid>

		<Prose>
			<h3>Getting there</h3>
			<ul>
				<li>
					<strong>By Metro:</strong> Indiranagar Metro Station (Purple Line), about a 20-minute walk.
				</li>
				<li>
					<strong>By Bus:</strong> Buses 335-E, 333-E, 201-G to Domlur Bridge Bus Stop.
				</li>
				<li>
					<strong>By Auto or Cab:</strong> Ask for Bangalore International Centre in Domlur.
				</li>
				<li>
					<strong>Driving:</strong> Limited basement parking for 4-wheelers and 2-wheelers. Valet parking
					available during event hours.
				</li>
			</ul>
		</Prose>

		<iframe
			src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.0!2d77.6382!3d12.9614!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae15c105a9b6f1%3A0x8ceeb4e9a1f70a07!2sBangalore%20International%20Centre!5e0!3m2!1sen!2sin!4v1"
			width="100%"
			height="350"
			style="border:0; border-radius: 8px;"
			allowfullscreen
			loading="lazy"
			referrerpolicy="no-referrer-when-downgrade"
			title="Bangalore International Centre on Google Maps"
		></iframe>

		<Cluster justify="start">
			<Button href="https://maps.app.goo.gl/nvCeGhT1x4e62o5z9" color="teal" external={true}
				>Open in Google Maps</Button
			>
		</Cluster>

		<DividerCurves />

		<!-- WhatsApp Group -->
		<Prose color="pink" id="whatsapp">
			<h2>Attendee WhatsApp Group</h2>
			<p>
				Whether you are joining online or in-person, connect with fellow attendees on our
				<strong>attendee-exclusive WhatsApp group</strong>. Share recommendations, coordinate
				meetups, and be part of the chatter.
			</p>
			<p>
				<em
					>The invite link will be shared closer to the event. If you are attending, you have
					received an email about this in your inbox.</em
				>
			</p>
		</Prose>

		<DividerCurves />

		<!-- Registration -->
		<Prose color="teal" id="registration">
			<h2>Registration</h2>
			<p>
				Registration opens at <strong>8:15 AM</strong> on the conference day. Show your confirmation email
				at the registration desk to collect your conference badge and kit.
			</p>
			<p>
				The event starts sharp at <strong>9:00 AM</strong>, and Bangalore traffic can be
				unpredictable, so arrive early.
			</p>
		</Prose>

		<DividerCurves />

		<!-- Food & Refreshments -->
		<Prose color="yellow" id="food">
			<h2>Food &amp; Refreshments</h2>
			<p>
				<strong>There is no breakfast on site</strong> on either day, so eat before you arrive or
				<a
					href="https://maps.app.goo.gl/cQXBEVRAXU7hWvf77"
					target="_blank"
					rel="noopener noreferrer">grab something nearby on your way in</a
				>.
			</p>
			<h3>Conference Day // 4th July</h3>
			<p>
				Chai and kaapi run all day on the <strong>1st floor</strong>, so help yourself between
				sessions. Lunch is on us: <strong>burrito bowls</strong> with a choice of protein, vegetarian
				(Mexican Paneer or Mushroom) or non-vegetarian (Crispy Chicken or BBQ Chicken).
			</p>
		</Prose>

		<Prose color="yellow">
			<h3>Workshop Day // 3rd July</h3>
			<p>
				There is no lunch on the workshop day, so plan to grab something nearby. We will have
				<strong>tea, coffee, cookies and light snacks</strong> during a break in between to keep you going.
			</p>
		</Prose>

		<DividerCurves />

		<!-- Workshops -->
		<Prose color="orange" id="workshops">
			<h2>Workshops // 3rd July</h2>
			<p>
				Workshop day is the day before the conference. Sessions run across two venues. Check the
				full workshop schedule and sign up if spots are still available.
			</p>
		</Prose>

		<Grid minWidth="28ch" maxColumns={2} gap={6}>
			<Card variant="bordered" color="orange" title="Bangalore International Centre (BIC)">
				<p>
					7, 4th Main Rd, Stage 2, Domlur,<br />
					Bengaluru, Karnataka 560071
				</p>
				<Button
					href="https://maps.app.goo.gl/nvCeGhT1x4e62o5z9"
					color="orange"
					external={true}
					size="sm"
					class_name="mt-4 px-3! py-2! justify-self-start">Google Maps</Button
				>
			</Card>
			<Card variant="bordered" color="orange" title="Underline Center">
				<p>
					2nd Floor, Indiranagar,<br />
					Bengaluru, Karnataka
				</p>
				<Button
					href="https://maps.app.goo.gl/ZcNqMtmzmqV4tcnd9"
					color="orange"
					external={true}
					size="sm"
					class_name="mt-4 px-3! py-2! justify-self-start">Google Maps</Button
				>
			</Card>
		</Grid>

		<Cluster justify="start">
			<Button href="/2026/sessions?type=Workshops" color="orange">View Workshop Schedule</Button>
		</Cluster>

		<DividerCurves />

		<!-- Code of Conduct -->
		<Prose color="pink" id="conduct">
			<h2>Code of Conduct</h2>
			<p>
				This code of conduct applies across online exchanges, conferences, and other events hosted
				by the VizChitra community.
			</p>
			<p>
				We are here as a community to deliberate on topics that matter to the craft. Be kind, be
				empathetic, be questioning. Discuss ideas, not people and their personalities.
			</p>
			<h3>Prohibited Behaviour</h3>
			<p>We strongly condemn any kind of harassment of fellow participants. This includes:</p>
			<ul>
				<li>Sustained disruption of talks, discussions, and other events.</li>
				<li>
					Offensive remarks or jokes made about women, men, persons of non-binary genders and those
					with physical disabilities, or on the basis of sexuality, race, caste, or religion.
				</li>
				<li>
					Use of images that objectify the human body unless absolutely relevant to the discussion.
				</li>
				<li>Inappropriate physical contact and invasion of private space.</li>
				<li>Deliberate intimidation, unwelcome gestures, and stalking.</li>
			</ul>
			<h3>Reporting</h3>
			<p>
				Please report in confidence by emailing
				<a href="mailto:hello@vizchitra.com">hello@vizchitra.com</a>
				or direct messaging the admins (Rasagy Sharma, Poojil Tiwari) on the VizChitra Community WhatsApp.
			</p>
			<p>
				To escalate, call Gurman Bhatia at
				<a href="tel:+919990044111">+91 9990 044 111</a> or Amit Kapoor at
				<a href="tel:+919739268197">+91 9739 268 197</a>.
			</p>
			<p>
				Violators, regardless of standing, may be expelled from the community without a refund and
				reported to the authorities.
			</p>
		</Prose>

		<DividerCurves />

		<!-- Accommodation -->
		<Prose color="yellow" id="accommodation">
			<h2>Accommodation</h2>
			<p>
				When choosing where to stay, look for options near
				<strong>Indiranagar, Bengaluru</strong>, close to BIC. This saves travel time, gives you
				more rest, and lets you walk to the venue.
			</p>
		</Prose>

		<Prose>
			<h3>Budget</h3>
			<ul>
				<li>
					<strong
						><a
							href="https://www.zostel.com/destination/bangalore/stay/bangalore-bngh107"
							target="_blank"
							rel="noopener">Zostel Bangalore</a
						></strong
					>
					— Popular backpacker hostel in Indiranagar. Dorms from Rs 600/night.
				</li>
				<li>
					<strong
						><a href="https://maps.app.goo.gl/FkyvUiSAXj7Cz5157" target="_blank" rel="noopener"
							>Aranha Homes</a
						></strong
					>
					— ~500m walk from BIC. From Rs 2,500/night.
				</li>
				<li>
					<strong
						><a href="https://maps.app.goo.gl/5bwqgZx5tHQMmq3s5" target="_blank" rel="noopener"
							>ICON Boutique Hotel</a
						></strong
					>
					— 3-star, ~400m walk from BIC. From Rs 2,800/night.
				</li>
			</ul>
			<h3>Mid-range</h3>
			<ul>
				<li>
					<strong
						><a href="https://maps.app.goo.gl/ZQD4JqurRLemXCAw7" target="_blank" rel="noopener"
							>Bloomrooms @ Indiranagar</a
						></strong
					>
					— 3-star, ~1.2km from BIC. From Rs 5,000/night.
				</li>
			</ul>
			<h3>Premium</h3>
			<ul>
				<li>
					<strong
						><a
							href="https://www.wyndhamhotels.com/ramada/h-b-c-s-layout-bangalore-india/ramada-encore-bangalore-domlur/overview"
							target="_blank"
							rel="noopener">Ramada Encore by Wyndham, Domlur</a
						></strong
					>
					— 4-star, ~2km from BIC in Domlur. From Rs 6,000/night.
				</li>
				<li>
					<strong
						><a
							href="https://www.google.com/travel/hotels/s/1NWyKkbdx8Nypqa3A"
							target="_blank"
							rel="noopener">Hotel Royal Orchid</a
						></strong
					>
					— 5-star, ~2.5km from BIC. From Rs 8,000/night.
				</li>
				<li>
					<strong
						><a
							href="https://www.google.com/travel/hotels/s/tjMpQz1sj5UthqL78"
							target="_blank"
							rel="noopener">Hilton Bangalore Embassy GolfLinks</a
						></strong
					>
					— 5-star, ~5km from BIC. From Rs 14,000/night.
				</li>
				<li>
					<strong
						><a
							href="https://www.google.com/travel/hotels/s/8MFkJgPGX4K4YHeSA"
							target="_blank"
							rel="noopener">The Leela Palace Bengaluru</a
						></strong
					>
					— 5-star, ~2km from BIC. From Rs 22,000/night.
				</li>
			</ul>
		</Prose>

		<Prose>
			<p>
				The general area to search for is <strong>Indiranagar</strong> or <strong>Domlur</strong>,
				Bengaluru. Plenty of options on OYO, MakeMyTrip, and Booking.com in this area.
			</p>
		</Prose>

		<DividerCurves />

		<!-- Get in Touch -->
		<Prose color="teal">
			<h2>Questions?</h2>
			<p>If anything is unclear or you need help, reach out. We are happy to assist.</p>
			<p>
				Email: <a href="mailto:hello@vizchitra.com">hello@vizchitra.com</a><br />
				Gurman Bhatia: <a href="tel:+919990044111">+91 9990 044 111</a><br />
				Amit Kapoor: <a href="tel:+919739268197">+91 9739 268 197</a>
			</p>
			<p>See you at VizChitra 2026.</p>
		</Prose>
	</Stack>
</Container>
