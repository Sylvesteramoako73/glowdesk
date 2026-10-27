import type { Faq } from './faqs'

export type FeatureIcon = 'calendar' | 'card' | 'users' | 'heart' | 'message'

export interface FeaturePage {
  slug: string
  name: string
  icon: FeatureIcon
  title: string
  description: string
  h1: string
  intro: string
  image: { src: string; alt: string }
  benefitsHeading: string
  benefits: { title: string; text: string }[]
  stepsHeading: string
  steps: { title: string; text: string }[]
  planNote: string
  faqs: Faq[]
  related: string[]
  relatedPost?: string
}

export const FEATURE_PAGES: FeaturePage[] = [
  {
    slug: 'online-booking',
    name: 'Online booking',
    icon: 'calendar',
    title: 'Salon Booking Software for Ghana | GlowDesk',
    description:
      'Give your salon a free online booking page. Clients pick the service, stylist and time, pay a deposit by Mobile Money or card, and you get fewer no shows.',
    h1: 'Salon booking software that lets clients book themselves',
    intro:
      'GlowDesk gives every salon its own online booking page. Clients choose a branch, their services, a stylist (or any available stylist) and a time, then enter their details, and the appointment lands straight in your diary. You can ask for a deposit through Paystack by card or Mobile Money, so the clients who book are the clients who come.',
    image: { src: '/images/salon-owner.jpg', alt: 'Salon owner taking a booking on her phone at the front desk' },
    benefitsHeading: 'Bookings without the back and forth',
    benefits: [
      { title: 'Your own booking page', text: 'Share one link on WhatsApp, Instagram and your Google profile. Clients book any time, even when you are with another client.' },
      { title: 'Clients choose the stylist', text: 'Clients can pick a favourite stylist or let you assign the best available person.' },
      { title: 'Deposits that cut no shows', text: 'Ask for a deposit at booking, paid through Paystack by card or Mobile Money and sent on to your salon.' },
      { title: 'Walk ins and recurring visits', text: 'Add walk ins in seconds and set recurring appointments for regular clients, such as a monthly retouch.' },
      { title: 'Every branch in one diary', text: 'Clients choose the branch they want, and each location keeps its own staff and schedule.' },
      { title: 'Track no shows', text: 'Mark appointments as completed or no show, so you can see who keeps their bookings and follow up with those who do not.' },
    ],
    stepsHeading: 'From sign up to first online booking',
    steps: [
      { title: 'Add your services', text: 'Enter your service menu with prices and how long each service takes.' },
      { title: 'Add your team', text: 'Add your stylists so clients can choose who they want. A slot that is already taken cannot be booked twice.' },
      { title: 'Share your link', text: 'Post your booking page on WhatsApp status, Instagram bio and your Google Business Profile.' },
    ],
    planNote: 'The online booking page is included on every plan, including Starter.',
    faqs: [
      { q: 'Is the online booking page free?', a: 'Yes. Every GlowDesk salon gets a public booking page at no extra cost, on every plan.' },
      { q: 'Can clients pay a deposit when they book?', a: 'Yes. You can require a deposit, paid through Paystack by card or Mobile Money. Deposits are one of the most effective ways to reduce no shows.' },
      { q: 'Can I still take bookings by phone and WhatsApp?', a: 'Yes. Your team can add any booking or walk in manually, so everything stays in one diary however the client reaches you.' },
    ],
    related: ['whatsapp-sms-reminders', 'clients-and-loyalty', 'point-of-sale'],
    relatedPost: 'how-to-reduce-no-shows-at-your-salon',
  },
  {
    slug: 'point-of-sale',
    name: 'Point of sale',
    icon: 'card',
    title: 'Salon POS with Mobile Money Payments | GlowDesk',
    description:
      'Sell services, products and gift cards in one checkout. Take cash, MTN MoMo, Telecel Cash, AirtelTigo Money, cards and bank transfer.',
    h1: 'A salon POS that takes Mobile Money, cards and cash',
    intro:
      'The GlowDesk point of sale lets you ring up services, retail products and gift cards in one checkout, apply a discount or loyalty points, assign each item to the stylist who did the work, and record how the client paid: cash, Mobile Money, card through Paystack, bank transfer or gift card. Every sale updates your revenue, stock and staff commission at the same time.',
    image: { src: '/images/salon-interior.jpg', alt: 'Bright modern salon interior with styling chairs and mirrors' },
    benefitsHeading: 'One checkout for everything you sell',
    benefits: [
      { title: 'Every way Ghanaians pay', text: 'Cash, Mobile Money on MTN, Telecel and AirtelTigo, Visa and Mastercard through Paystack, bank transfer and gift cards.' },
      { title: 'Services and products together', text: 'Add a braid installation and a bottle of edge control to the same sale. Product stock is updated automatically.' },
      { title: 'Staff credited correctly', text: 'Assign each service to the stylist who did it, so commission is calculated without arguments at month end.' },
      { title: 'Gift cards', text: 'Sell gift cards with unique codes, redeem them at checkout and see outstanding balances at any time.' },
      { title: 'Discounts and loyalty points', text: 'Apply a discount or let loyal clients spend their points, recorded properly in the sale.' },
      { title: 'Receipts and invoices', text: 'Download a receipt for any sale and keep a clear invoice history for your records.' },
    ],
    stepsHeading: 'How a checkout works',
    steps: [
      { title: 'Choose the client', text: 'Pick an existing client or record a walk in.' },
      { title: 'Add the items', text: 'Add services and products, and assign the stylist for each service.' },
      { title: 'Take payment', text: 'Select the payment method and complete the sale. The receipt is ready instantly.' },
    ],
    planNote: 'Point of sale is included on every plan. Inventory management is on Pro and above.',
    faqs: [
      { q: 'Can my salon accept Mobile Money in GlowDesk?', a: 'Yes. The point of sale records Mobile Money on MTN, Telecel and AirtelTigo, as well as cash, cards through Paystack, bank transfer and gift cards.' },
      { q: 'Does selling a product reduce my stock?', a: 'Yes. Products sold through the point of sale are taken off your stock count, and you can set a low stock alert level for each product on the Pro plan and above.' },
      { q: 'Can I sell gift cards?', a: 'Yes. Issue gift cards with a unique code, then redeem them at checkout. GlowDesk tracks each card’s balance and expiry date.' },
    ],
    related: ['staff-and-commission', 'clients-and-loyalty', 'online-booking'],
    relatedPost: 'choosing-salon-software-ghana',
  },
  {
    slug: 'staff-and-commission',
    name: 'Staff and commission',
    icon: 'users',
    title: 'Salon Staff Commission and Payroll Software | GlowDesk',
    description:
      'Track what every stylist earns. GlowDesk calculates commission, shows revenue per staff member and keeps your salon expenses and profit clear.',
    h1: 'Staff commission and payroll without the month end arguments',
    intro:
      'GlowDesk records which stylist did each appointment and sale, then shows every staff member’s appointments, the revenue they generated and the commission they earned for any date range. Add your rent, wages, supplies and other expenses, and you see your salon’s real profit, not just its takings.',
    image: { src: '/images/team.jpg', alt: 'Salon team working together' },
    benefitsHeading: 'Clear numbers for you and your team',
    benefits: [
      { title: 'Commission calculated for you', text: 'Set a commission percentage for each stylist, and GlowDesk works out what they earned from their revenue for any date range.' },
      { title: 'Revenue per stylist', text: 'See appointments and revenue generated by each team member, so you know who is growing the business.' },
      { title: 'Roles and schedules', text: 'Give owners, managers and stylists the right access, and let each stylist see their own schedule.' },
      { title: 'Expenses and profit', text: 'Record rent, utilities, wages, supplies, marketing and equipment, and see net profit by month and by branch.' },
      { title: 'Apprentice tracking', text: 'Track apprentices, their mentors, attendance, skill sign offs and expected graduation on the Enterprise plan.' },
      { title: 'Every branch', text: 'Compare staff, bookings and revenue across locations from one dashboard.' },
    ],
    stepsHeading: 'Running payroll at month end',
    steps: [
      { title: 'Set the period', text: 'Choose the date range you pay for, such as the last calendar month.' },
      { title: 'Review the report', text: 'Check appointments, revenue and commission for each stylist.' },
      { title: 'Pay with confidence', text: 'Pay your team knowing the figures match the work that was actually done.' },
    ],
    planNote: 'Payroll and expenses are on the Pro plan and above. Apprenticeship tracking is on Enterprise.',
    faqs: [
      { q: 'How does GlowDesk calculate stylist commission?', a: 'You set a commission percentage for each stylist. Each appointment and sale is assigned to a stylist, and GlowDesk applies their percentage to the revenue they generated in the period you choose.' },
      { q: 'Can I track salon expenses?', a: 'Yes. On the Pro plan and above you can record expenses by category, such as rent, utilities, wages and supplies, and see net profit for each month and branch.' },
      { q: 'Can I manage apprentices in GlowDesk?', a: 'Yes. The Enterprise plan includes apprenticeship tracking: mentors, attendance, skill sign offs, progress notes, stipends and a certificate when they graduate.' },
    ],
    related: ['point-of-sale', 'online-booking', 'clients-and-loyalty'],
    relatedPost: 'how-to-calculate-stylist-commission',
  },
  {
    slug: 'clients-and-loyalty',
    name: 'Clients and loyalty',
    icon: 'heart',
    title: 'Salon Client Management and Loyalty Program | GlowDesk',
    description:
      'Keep every client’s history, spend and birthday in one place, reward regulars with loyalty tiers and points, and give each client their own portal link.',
    h1: 'Client management and loyalty that keeps clients coming back',
    intro:
      'GlowDesk keeps a profile for every client with their phone number, birthday, visit history, last visit, total spent and notes, so any stylist can serve them like a regular. A built in loyalty programme moves clients through Bronze, Silver, Gold and Platinum tiers as they earn points, and every client can have their own portal link.',
    image: { src: '/images/salon-owner.jpg', alt: 'Salon owner smiling while speaking with a client on the phone' },
    benefitsHeading: 'Know every client, reward the loyal ones',
    benefits: [
      { title: 'Complete client profiles', text: 'Contact details, date of birth, notes, visits, last visit and total spent, all on one screen.' },
      { title: 'Loyalty tiers and points', text: 'Clients earn points and move from Bronze to Silver, Gold and Platinum. They can spend points at checkout.' },
      { title: 'VIP clients at a glance', text: 'Filter by tier to see your most valuable clients and look after them properly.' },
      { title: 'Client portal', text: 'Copy a personal portal link for any client and send it to them on WhatsApp.' },
      { title: 'Import from a spreadsheet', text: 'Bring in your existing client list from a CSV file instead of typing it again.' },
      { title: 'Birthday and tier messages', text: 'Pair with automations to wish clients happy birthday and congratulate them when they reach a new tier.' },
    ],
    stepsHeading: 'Getting your client list in',
    steps: [
      { title: 'Import or add', text: 'Upload a CSV of your current clients, or let profiles build up as clients book.' },
      { title: 'Turn on loyalty', text: 'Clients start earning points with each visit, and tiers update automatically.' },
      { title: 'Stay in touch', text: 'Use birthdays, last visit dates and tiers to reach the right clients at the right time.' },
    ],
    planNote: 'Client profiles are on every plan. Automated birthday and loyalty messages need Automations, on Pro and above.',
    faqs: [
      { q: 'Does GlowDesk have a loyalty programme?', a: 'Yes. Clients earn points and move through Bronze, Silver, Gold and Platinum tiers. Points can be used at the point of sale.' },
      { q: 'Can I import clients from Excel?', a: 'Yes. Save your list as a CSV file from Excel or Google Sheets and import it into GlowDesk.' },
      { q: 'What is the client portal?', a: 'Each client can have a personal portal link, which you can copy from their profile and share with them on WhatsApp.' },
    ],
    related: ['whatsapp-sms-reminders', 'point-of-sale', 'online-booking'],
    relatedPost: 'how-to-reduce-no-shows-at-your-salon',
  },
  {
    slug: 'whatsapp-sms-reminders',
    name: 'WhatsApp and SMS reminders',
    icon: 'message',
    title: 'Salon Appointment Reminders on WhatsApp and SMS | GlowDesk',
    description:
      'Send automatic appointment reminders, thank you notes, review requests, birthday wishes and win back offers on WhatsApp, SMS or email.',
    h1: 'Automatic WhatsApp and SMS reminders for your salon',
    intro:
      'GlowDesk automations send the messages your front desk never has time for. Appointment reminders go out before each visit, thank you notes and review requests after it, no show follow ups when someone misses, birthday wishes on the day, and win back messages to clients who have not visited in a while, on WhatsApp, SMS or email.',
    image: { src: '/images/salon-interior.jpg', alt: 'Calm salon interior ready for the day’s appointments' },
    benefitsHeading: 'Nine automations, ready to switch on',
    benefits: [
      { title: 'Appointment reminders', text: 'Remind clients before their appointment so fewer people forget.' },
      { title: 'No show follow up', text: 'Reach out automatically to clients who missed their appointment and invite them to rebook.' },
      { title: 'Thank you and review requests', text: 'Thank clients after their visit and ask happy clients for a review.' },
      { title: 'Birthday messages', text: 'Wish every client a happy birthday on their day, with their name filled in.' },
      { title: 'Win back inactive clients', text: 'Send a friendly message to clients who have not visited in a while.' },
      { title: 'Welcome, payment and loyalty messages', text: 'Welcome first time clients, confirm payments, and congratulate clients on a new loyalty tier.' },
    ],
    stepsHeading: 'Setting up an automation',
    steps: [
      { title: 'Pick a trigger', text: 'For example, before an appointment, after a no show, or on a client’s birthday.' },
      { title: 'Choose the channel', text: 'Send on WhatsApp, SMS or email, and edit the message template.' },
      { title: 'Switch it on', text: 'GlowDesk sends the messages and shows how many ran this month.' },
    ],
    planNote: 'Automations and SMS are included on the Pro plan and above.',
    faqs: [
      { q: 'Can GlowDesk send WhatsApp appointment reminders?', a: 'Yes. Appointment reminders, and the other automations, can be sent on WhatsApp, SMS or email.' },
      { q: 'Which automations are included?', a: 'Appointment reminder, post visit thank you, review request, no show follow up, birthday message, new client welcome, win back message, payment confirmation and loyalty tier upgrade.' },
      { q: 'Which plan includes automations?', a: 'Automations and SMS are included on the Pro plan at GHS 350 a month, and on Enterprise.' },
    ],
    related: ['online-booking', 'clients-and-loyalty', 'staff-and-commission'],
    relatedPost: 'how-to-reduce-no-shows-at-your-salon',
  },
]

export const featureBySlug = (slug: string) => FEATURE_PAGES.find(f => f.slug === slug)
