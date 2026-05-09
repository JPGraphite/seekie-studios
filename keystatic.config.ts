import { config, collection, singleton, fields } from '@keystatic/core';

const settingsImage = (label: string, description?: string) =>
  fields.image({
    label,
    description,
    directory: 'src/assets/settings',
    publicPath: '/src/assets/settings/',
    validation: { isRequired: false },
  });

const colourOptions = [
  { label: 'Pink', value: 'pink' },
  { label: 'Orange', value: 'orange' },
  { label: 'Mint', value: 'mint' },
  { label: 'Lemon', value: 'lemon' },
  { label: 'Plum', value: 'plum' },
  { label: 'Grape', value: 'grape' },
];

export default config({
  storage:
    { kind: 'github', repo: { owner: 'JPGraphite', name: 'seekie-studios' } },

  collections: {
    events: collection({
      label: 'Events',
      slugField: 'title',
      path: 'src/content/events/*',
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        date: fields.date({ label: 'Date' }),
        time: fields.text({ label: 'Time', description: 'e.g. 4:30pm' }),
        venue: fields.text({ label: 'Venue' }),
        venueAddress: fields.text({ label: 'Venue address' }),
        region: fields.select({
          label: 'Region',
          options: [
            { label: 'Geelong', value: 'geelong' },
            { label: 'Surf Coast', value: 'surf-coast' },
            { label: 'Bellarine', value: 'bellarine' },
            { label: 'Other', value: 'other' },
          ],
          defaultValue: 'geelong',
        }),
        price: fields.integer({ label: 'Price per person ($)' }),
        duration: fields.text({ label: 'Duration', description: 'e.g. 2.5 hours · bottomless drinks pkg' }),
        seatsLeft: fields.integer({ label: 'Seats left', validation: { isRequired: false } }),
        totalSeats: fields.integer({ label: 'Total seats', validation: { isRequired: false } }),
        ticketUrl: fields.url({ label: 'Humanitix ticket URL' }),
        coverColor: fields.text({ label: 'Cover colour', description: 'Tailwind colour class, e.g. bg-plum' }),
        coverVariant: fields.select({
          label: 'Cover variant',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Grape moon', value: 'grape-moon' },
            { label: 'Orange blobs', value: 'orange-blobs' },
            { label: 'Grape mint', value: 'grape-mint' },
          ],
          defaultValue: 'default',
        }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Available', value: 'available' },
            { label: 'Sold out', value: 'sold-out' },
            { label: 'Waitlist', value: 'waitlist' },
          ],
          defaultValue: 'available',
        }),
        order: fields.integer({ label: 'Display order', defaultValue: 0 }),
        cover: fields.image({
          label: 'Cover photo (optional - replaces blob pattern)',
          directory: 'src/assets/events',
          publicPath: '/src/assets/events/',
        }),
      },
    }),
  },

  singletons: {
    site: singleton({
      label: 'Site (contact + socials)',
      path: 'src/content/settings/site',
      format: { data: 'json' },
      schema: {
        email: fields.text({ label: 'Contact email' }),
        phone: fields.text({ label: 'Phone', validation: { isRequired: false } }),
        abn: fields.text({ label: 'ABN', validation: { isRequired: false } }),
        instagram: fields.url({ label: 'Instagram URL', validation: { isRequired: false } }),
        facebook: fields.url({ label: 'Facebook URL', validation: { isRequired: false } }),
      },
    }),

    seo: singleton({
      label: 'SEO & favicon',
      path: 'src/content/settings/seo',
      format: { data: 'json' },
      schema: {
        title: fields.text({
          label: 'Page title',
          defaultValue: 'Seekie Studios - Paint & Sip Parties · Geelong / Surf Coast / Bellarine',
        }),
        description: fields.text({
          label: 'Meta description',
          multiline: true,
          defaultValue: 'Private mobile paint & sip parties across Geelong, the Surf Coast and the Bellarine. We come to you, fully BYO, custom paintings to suit your theme.',
        }),
        ogImage: settingsImage('Open Graph image (1200x630px)', 'Used when the site is shared on social media. 1200x630px recommended.'),
        favicon: settingsImage('Favicon', 'Falls back to /favicon.svg if not set. SVG recommended.'),
      },
    }),

    nav: singleton({
      label: 'Navigation',
      path: 'src/content/settings/nav',
      format: { data: 'json' },
      schema: {
        brandName: fields.text({ label: 'Brand name', defaultValue: 'Seekie Studios' }),
        tagline: fields.text({ label: 'Tagline', defaultValue: 'Paint · Sip · Geelong' }),
        logo: settingsImage('Logo', 'Shown in the nav bar. SVG recommended.'),
        navLinks: fields.array(
          fields.object({
            label: fields.text({ label: 'Label' }),
            href: fields.text({ label: 'Link (e.g. #events)' }),
          }),
          {
            label: 'Nav links',
            itemLabel: (props) => props.fields.label.value,
          },
        ),
        ctaLabel: fields.text({ label: 'CTA button label', defaultValue: 'Book a Party →' }),
        ctaHref: fields.text({ label: 'CTA button href', defaultValue: '#book' }),
      },
    }),

    hero: singleton({
      label: 'Hero',
      path: 'src/content/settings/hero',
      format: { data: 'json' },
      schema: {
        eyebrow: fields.text({ label: 'Eyebrow', defaultValue: 'Geelong · Surf Coast · Bellarine' }),
        headline: fields.text({
          label: 'Headline (HTML allowed)',
          multiline: true,
          defaultValue: 'Paint, <br>\n<span class="gw">sip</span>, <em>repeat.</em>',
          description: 'Renders as HTML. Use <span class="gw"> for the pink word and <em> for the underlined word.',
        }),
        lede: fields.text({
          label: 'Lede paragraph',
          multiline: true,
          defaultValue: "Private mobile paint & sip parties - we roll up to your house, your venue, your bar. Fully BYO, custom paintings to suit your theme, all the canvases, easels & aprons sorted. You bring the crew & the playlist. 🎨",
        }),
        primaryCtaLabel: fields.text({ label: 'Primary CTA label', defaultValue: 'Book a private party' }),
        primaryCtaHref: fields.text({ label: 'Primary CTA href', defaultValue: '#book' }),
        secondaryCtaLabel: fields.text({ label: 'Secondary CTA label', defaultValue: 'See upcoming events' }),
        secondaryCtaHref: fields.text({ label: 'Secondary CTA href', defaultValue: '#events' }),
        stats: fields.array(
          fields.object({
            value: fields.text({ label: 'Value' }),
            label: fields.text({ label: 'Label' }),
          }),
          {
            label: 'Stats (3)',
            itemLabel: (props) => `${props.fields.value.value} - ${props.fields.label.value}`,
          },
        ),
        polaroids: fields.array(
          fields.object({
            caption: fields.text({ label: 'Caption' }),
            image: settingsImage('Photo', 'Optional. Falls back to placeholder box if empty.'),
          }),
          {
            label: 'Polaroid slots (4)',
            itemLabel: (props) => props.fields.caption.value || 'Polaroid',
          },
        ),
      },
    }),

    ticker: singleton({
      label: 'Ticker',
      path: 'src/content/settings/ticker',
      format: { data: 'json' },
      schema: {
        items: fields.array(
          fields.text({ label: 'Item' }),
          {
            label: 'Ticker items',
            itemLabel: (props) => props.value,
          },
        ),
      },
    }),

    howItWorks: singleton({
      label: 'How it works',
      path: 'src/content/settings/how-it-works',
      format: { data: 'json' },
      schema: {
        tag: fields.text({ label: 'Section tag', defaultValue: 'how it works' }),
        title: fields.text({
          label: 'Title (HTML allowed)',
          multiline: true,
          defaultValue: 'A paint party,<br>delivered to your door.',
        }),
        subtitle: fields.text({
          label: 'Subtitle',
          multiline: true,
          defaultValue: "We're a small mobile studio based on the Bellarine. We pack up everything you need and turn your living room, backyard or function space into the studio for the night.",
        }),
        steps: fields.array(
          fields.object({
            title: fields.text({ label: 'Title' }),
            body: fields.text({ label: 'Body', multiline: true }),
            icon: fields.select({
              label: 'Icon',
              options: [
                { label: 'Palette', value: 'palette' },
                { label: 'Easel', value: 'easel' },
                { label: 'Glass', value: 'glass' },
              ],
              defaultValue: 'palette',
            }),
            color: fields.select({
              label: 'Accent colour',
              options: colourOptions,
              defaultValue: 'pink',
            }),
          }),
          {
            label: 'Steps (3)',
            itemLabel: (props) => props.fields.title.value,
          },
        ),
        perks: fields.array(
          fields.text({ label: 'Perk (HTML allowed, e.g. <b>...</b>)', multiline: true }),
          {
            label: 'Perks (5)',
            itemLabel: (props) => (props.value || '').replace(/<[^>]+>/g, '').slice(0, 60),
          },
        ),
      },
    }),

    astrayBar: singleton({
      label: 'Astray Bar',
      path: 'src/content/settings/astray-bar',
      format: { data: 'json' },
      schema: {
        tag: fields.text({ label: 'Section tag', defaultValue: 'in partnership with' }),
        title: fields.text({
          label: 'Title (HTML allowed)',
          multiline: true,
          defaultValue: 'Sip with us at<br>Astray Bar.',
        }),
        lede: fields.text({
          label: 'Lede paragraph (HTML allowed)',
          multiline: true,
          defaultValue: 'Our favourite place to host public events. Astray pours up bottomless drinks packages (their <b>mocktails</b> are absurd) and the <b>poutine</b> - chips, cheese curds, gravy - is genuinely the best post-painting dinner in Geelong.',
        }),
        ctaLabel: fields.text({ label: 'CTA label', defaultValue: 'See Astray events' }),
        ctaHref: fields.text({ label: 'CTA href', defaultValue: '#events' }),
        perks: fields.array(
          fields.object({
            icon: fields.text({ label: 'Icon (emoji)' }),
            heading: fields.text({ label: 'Heading' }),
            body: fields.text({ label: 'Body', multiline: true }),
          }),
          {
            label: 'Perks (4)',
            itemLabel: (props) => props.fields.heading.value,
          },
        ),
        nextSession: fields.object({
          label: fields.text({ label: 'Card label', defaultValue: 'Next session ✺' }),
          heading: fields.text({ label: 'Heading' }),
          headingAccent: fields.text({ label: 'Heading accent (last word, coloured)' }),
          dateLine: fields.text({ label: 'Date line' }),
          venueLine: fields.text({ label: 'Venue line' }),
          priceLine: fields.text({ label: 'Price line' }),
          hostBy: fields.text({ label: 'Run by', defaultValue: 'Seekie Studios' }),
          hostAt: fields.text({ label: 'Hosted at', defaultValue: 'Astray Bar' }),
        }),
      },
    }),

    bookingForm: singleton({
      label: 'Booking form',
      path: 'src/content/settings/booking-form',
      format: { data: 'json' },
      schema: {
        heading: fields.text({
          label: 'Heading (HTML allowed)',
          multiline: true,
          defaultValue: 'Got a date<br>in mind? <span class="pink">Let\'s paint.</span>',
        }),
        intro: fields.text({
          label: 'Intro paragraph',
          multiline: true,
          defaultValue: "Hens parties, milestone birthdays, book club, team builds, divorce parties, just-because parties. Tell us the vibe and we'll come back with a quote within 24 hours.",
        }),
        sidebarLocation: fields.text({
          label: 'Sidebar - location line',
          defaultValue: '📍 Geelong · Surf Coast · Bellarine (other locations on request)',
        }),
        sidebarDuration: fields.text({
          label: 'Sidebar - duration line',
          defaultValue: '⏱ Sessions run approx. 2-3 hours',
        }),
        nameLabel: fields.text({ label: 'Name field label', defaultValue: 'Your name' }),
        namePlaceholder: fields.text({ label: 'Name field placeholder', defaultValue: 'Aria' }),
        groupSizeLabel: fields.text({ label: 'Group size field label', defaultValue: 'Group size' }),
        groupSizePlaceholder: fields.text({ label: 'Group size placeholder', defaultValue: '12' }),
        emailLabel: fields.text({ label: 'Email field label', defaultValue: 'Email' }),
        emailPlaceholder: fields.text({ label: 'Email placeholder', defaultValue: 'you@email.com' }),
        dateLabel: fields.text({ label: 'Date field label', defaultValue: 'Date' }),
        regionLabel: fields.text({ label: 'Region field label', defaultValue: 'Region' }),
        regionOptions: fields.array(
          fields.object({
            label: fields.text({ label: 'Label' }),
            value: fields.text({ label: 'Value (slug)' }),
          }),
          {
            label: 'Region options',
            itemLabel: (props) => props.fields.label.value,
          },
        ),
        themeLabel: fields.text({ label: 'Theme/vibe field label', defaultValue: 'Theme / vibe' }),
        themePlaceholder: fields.text({
          label: 'Theme/vibe placeholder',
          defaultValue: 'Hens party - coastal florals + bottomless mimosas',
        }),
        notesLabel: fields.text({ label: 'Notes field label', defaultValue: 'Anything else?' }),
        notesPlaceholder: fields.text({
          label: 'Notes field placeholder',
          defaultValue: 'Allergies, accessibility needs, BYO plans, surprise party shhh...',
        }),
        submitLabel: fields.text({ label: 'Submit button label', defaultValue: 'Send enquiry →' }),
        successMessage: fields.text({
          label: 'Success message',
          defaultValue: "Thanks - we'll be in touch within 24h ✿",
        }),
        errorMessage: fields.text({
          label: 'Error message',
          defaultValue: 'Something went wrong - please email us directly.',
        }),
      },
    }),

    footer: singleton({
      label: 'Footer',
      path: 'src/content/settings/footer',
      format: { data: 'json' },
      schema: {
        logo: settingsImage('Footer logo'),
        brandName: fields.text({ label: 'Brand name', defaultValue: 'Seekie Studios' }),
        brandSub: fields.text({ label: 'Brand sub-line', defaultValue: 'Mobile Paint & Sip' }),
        description: fields.text({
          label: 'Brand description',
          multiline: true,
          defaultValue: 'Private & public paint & sip parties across Geelong, the Surf Coast and the Bellarine. We come to you, fully BYO, custom paintings to suit your theme.',
        }),
        exploreHeading: fields.text({ label: 'Explore column heading', defaultValue: 'Explore' }),
        exploreLinks: fields.array(
          fields.object({
            label: fields.text({ label: 'Label' }),
            href: fields.text({ label: 'Href' }),
          }),
          {
            label: 'Explore column links',
            itemLabel: (props) => props.fields.label.value,
          },
        ),
        contactHeading: fields.text({ label: 'Contact column heading', defaultValue: 'Get in touch' }),
        regionsLine: fields.text({
          label: 'Regions line (shown under contact links)',
          defaultValue: 'Geelong · Surf Coast · Bellarine',
        }),
        legalLine: fields.text({
          label: 'Legal line',
          defaultValue: '© 2026 Seekie Studios · Made with paint & love on the Bellarine.',
        }),
        legalSubLine: fields.text({
          label: 'Legal sub-line (after ABN)',
          defaultValue: 'Mobile paint & sip parties.',
        }),
      },
    }),
  },
});
