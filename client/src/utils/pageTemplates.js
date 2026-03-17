const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9);

export const pageTemplates = {
  modern_wedding: {
    name: "Wedding Moderno",
    description: "Design elegante con foto a tutto schermo e testi centrati (Canva Style).",
    createBlocks: () => [
      {
        id: generateId(),
        type: "photo",
        x: 400, 
        y: 0,
        width: 800,
        height: 550,
        props: {
          image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200",
          caption: ""
        }
      },
      {
        id: generateId(),
        type: "text",
        x: 400,
        y: 480,
        width: 550,
        height: 180,
        props: {
          heading: "Marco & Giulia",
          body: "Siamo felicissimi di invitarvi a condividere con noi il giorno più importante della nostra vita.\n\nDi seguito troverete tutti i dettagli dell'evento e il modulo per confermare la vostra presenza.",
        }
      },
      {
        id: generateId(),
        type: "map",
        x: 400,
        y: 750,
        width: 700,
        height: 380,
        props: {
          title: "Dove e Quando",
          address: "Villa Esempio, Via Roma 1, Roma RM",
        }
      },
      {
        id: generateId(),
        type: "rsvp",
        x: 400,
        y: 1180,
        width: 600,
        height: 500,
        props: {}
      }
    ]
  },
  birthday_party: {
    name: "Party Esclusivo",
    description: "Layout dinamico con immagini intrecciate e font vivaci.",
    createBlocks: () => [
      {
        id: generateId(),
        type: "text",
        x: 400,
        y: 80,
        width: 700,
        height: 150,
        props: {
          heading: "LET'S PARTY!",
          body: "Siete tutti invitati a festeggiare il mio 30° compleanno! Ci sarà musica, buon cibo e drink illimitati.",
        }
      },
      {
        id: generateId(),
        type: "photo",
        x: 250,
        y: 250,
        width: 350,
        height: 250,
        props: {
          image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=800",
        }
      },
      {
        id: generateId(),
        type: "photo",
        x: 550,
        y: 350,
        width: 350,
        height: 350,
        props: {
          image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800",
        }
      },
      {
        id: generateId(),
        type: "map",
        x: 400,
        y: 750,
        width: 650,
        height: 350,
        props: {
          title: "Location Club",
          address: "Club Esempio, Milano",
        }
      },
      {
        id: generateId(),
        type: "rsvp",
        x: 400,
        y: 1150,
        width: 600,
        height: 500,
        props: {}
      }
    ]
  },
  minimal_event: {
    name: "Corporate Minimal",
    description: "Ideale per eventi aziendali, mostre o cene di gala.",
    createBlocks: () => [
      {
        id: generateId(),
        type: "photo",
        x: 400,
        y: 40,
        width: 720,
        height: 350,
        props: {
          image: "https://images.unsplash.com/photo-1515169067868-5387aecfd5ce?auto=format&fit=crop&q=80&w=1200",
        }
      },
      {
        id: generateId(),
        type: "text",
        x: 400,
        y: 430,
        width: 600,
        height: 200,
        props: {
          heading: "Summit 2026",
          body: "Unisciti a noi per una serata speciale di networking e condivisione sulle prossime innovazioni.\n\nTi preghiamo di confermare la tua presenza compilando il modulo sottostante.",
        }
      },
      {
        id: generateId(),
        type: "rsvp",
        x: 400,
        y: 650,
        width: 600,
        height: 500,
        props: {}
      }
    ]
  }
};
