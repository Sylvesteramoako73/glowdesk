export interface Faq { q: string; a: string }

export const FAQS: Faq[] = [
  { q: 'Do I need a credit card to start?', a: 'No. Your 14 day trial is completely free and needs no card. You only pay when you decide to subscribe.' },
  { q: 'How much does GlowDesk cost?', a: 'Starter is GHS 150 a month for up to 3 staff, Pro is GHS 350 a month with unlimited staff, payroll, automations, SMS, inventory and up to 3 locations, and Enterprise is GHS 700 a month for salon chains with unlimited locations and apprenticeship tracking. Every plan starts with a 14 day free trial.' },
  { q: 'Can I import my existing client data?', a: 'Yes. You can import clients from a CSV file, or add them one by one as they book.' },
  { q: 'Does GlowDesk work for barbershops?', a: 'Yes. GlowDesk works for any appointment based beauty business, including salons, barbershops, spas, nail studios and lash studios.' },
  { q: 'Can my clients book online?', a: 'Yes. Every salon gets a free public booking page. Share the link on WhatsApp or Instagram and clients choose the service, stylist and time themselves.' },
  { q: 'Can clients pay a deposit when they book?', a: 'Yes. You can ask for a deposit at booking, paid through Paystack by card or Mobile Money, which is one of the most effective ways to cut no shows.' },
  { q: 'Which payment methods can my salon accept?', a: 'The point of sale records cash, Mobile Money (MTN, Telecel and AirtelTigo), Visa and Mastercard through Paystack, bank transfer and GlowDesk gift cards.' },
  { q: 'How do appointment reminders work?', a: 'Automations send messages for you on WhatsApp, SMS or email: reminders before appointments, thank you messages after visits, no show follow ups, birthday wishes and win back messages for clients who have not visited in a while. Automations and SMS are on the Pro plan and above.' },
  { q: 'Is my data safe?', a: 'Yes. All data is encrypted and stored securely on Google Cloud (Firebase). We never share your data with third parties.' },
  { q: 'What payment methods do you accept for my subscription?', a: 'We accept Paystack, which covers cards and Mobile Money. Prices are in cedis, so there are no foreign exchange surprises.' },
]

export const faqPageLd = (items: Faq[]) => ({
  '@type': 'FAQPage',
  mainEntity: items.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
})
