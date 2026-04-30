export interface Thirukkural {
    id: number;
    line1: string;
    line2: string;
    meaning?: string;
    number: number;
}

export const kurals: Thirukkural[] = [
    {
        id: 1,
        line1: "அன்பும் அறனும் உடைத்தாயின் இல்வாழ்க்கை",
        line2: "பண்பும் பயனும் அது.",
        number: 45
    },
    {
        id: 2,
        line1: "அகர முதல எழுத்தெல்லாம் ஆதி",
        line2: "பகவன் முதற்றே உலகு.",
        number: 1
    },
    {
        id: 3,
        line1: "தொட்டனைத் தூறும் மணற்கேணி மாந்தர்க்குக்",
        line2: "கற்றனைத் தூறும் அறிவு.",
        number: 396
    },
    {
        id: 4,
        line1: "துப்பார்க்குத் துப்பாய துப்பாக்கித் துப்பார்க்குத்",
        line2: "துப்பாய தூஉ மழை.",
        meaning: "உண்பவர்க்குத் தக்க உணவுப் பொருள்களை விளைவித்துத் தருவதோடு, பருகுவார்க்குத் தானும் ஓர் உணவாக இருப்பது மழையாகும்",
        number: 12
    },
    {
        id: 5,
        line1: "கேடில் விழுச்செல்வம் கல்வி யொருவற்கு",
        line2: "மாடல்ல மற்றை யவை.",
        number: 400
    },
    {
        id: 6,
        line1: "சொல்லுதல் யார்க்கும் எளிய அரியவாம்",
        line2: "சொல்லிய வண்ணம் செயல்.",
        number: 664
    },
    {
        id: 7,
        line1: "எண்ணிய எண்ணியாங்கு எய்து எண்ணியார்",
        line2: "திண்ணியர் ஆகப் பெறின்.",
        number: 666
    },
    {
        id: 8,
        line1: "உள்ளுவ தெல்லாம் உயர்வுள்ளல் மற்றது",
        line2: "தள்ளினுந் தள்ளாமை நீர்த்து.",
        number: 596
    }
];

export function getDailyKural(): Thirukkural {
    const now = new Date();
    // Simple seed based on date
    const seed = now.getFullYear() * 1000 + (now.getMonth() + 1) * 100 + now.getDate();
    const index = seed % kurals.length;
    return kurals[index];
}
