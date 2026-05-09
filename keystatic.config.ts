import { config, collection, singleton, fields } from '@keystatic/core';

export default config({
  storage:
    process.env.NODE_ENV === 'production'
      ? { kind: 'github', repo: { owner: 'JPGraphite', name: 'seekie-studios' } }
      : { kind: 'local' },

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
          label: 'Cover photo (optional — replaces blob pattern)',
          directory: 'src/assets/events',
          publicPath: '/src/assets/events/',
        }),
      },
    }),
  },

  singletons: {
    settings: singleton({
      label: 'Site settings',
      path: 'src/content/settings/site',
      format: { data: 'json' },
      schema: {
        email: fields.text({ label: 'Contact email' }),
        phone: fields.text({ label: 'Phone', validation: { isRequired: false } }),
        abn: fields.text({ label: 'ABN', validation: { isRequired: false } }),
        instagram: fields.url({ label: 'Instagram URL' }),
        facebook: fields.url({ label: 'Facebook URL' }),
      },
    }),
  },
});
