// Abimanyu's wisdom responses based on Bhagavad Gita teachings
// These are example responses - in a real app, this would connect to an AI backend

interface ResponsePattern {
  keywords: string[];
  response: string;
}

const responsePatterns: ResponsePattern[] = [
  {
    keywords: ["fail", "failed", "failure", "lost", "losing"],
    response: `I hear you, and I want you to know — feeling defeated after a setback is deeply human. You are not broken; you are learning.

The Bhagavad Gita teaches us a profound truth: "You have the right to work, but never to the fruit of work." This doesn't mean we shouldn't care about outcomes. It means our worth isn't measured by results alone.

Think of Tiruppur Kumaran, who at just 19, held the Indian flag high even as he fell. Did he "fail"? By some measures, yes. But his courage ignited a movement. His effort became his legacy.

Your failure is not your ending — it's a chapter. What you do next is what defines you.

One small step: Write down one thing this experience taught you. Wisdom often hides in our hardest moments.

— Abimanyu`
  },
  {
    keywords: ["anxious", "anxiety", "worried", "worry", "stress", "stressed", "nervous"],
    response: `I feel the weight in your words. Anxiety can make the future feel like a storm approaching, and the present like standing in its shadow.

The Gita reminds us: "For one who has conquered the mind, the mind is the best of friends; but for one who has failed to do so, the mind will remain the greatest enemy."

This isn't about forcing calm. It's about recognizing that your thoughts, however loud, are not commands you must obey. You can observe them, breathe through them, and let them pass like clouds.

A small practice: Place your hand on your heart right now. Breathe slowly. Feel your own presence. You are here. You are safe in this moment.

The storm in your mind will quiet. And I'll be here as you navigate through.

— Abimanyu`
  },
  {
    keywords: ["lonely", "alone", "no one", "nobody", "isolated"],
    response: `Loneliness can feel like standing in a crowded room yet feeling invisible. I see you. Your feelings are valid.

The Bhagavad Gita speaks of the soul's connection to all beings: "The wise see with equal vision a learned scholar, a cow, an elephant, a dog, and an outcaste." We are all connected, even when we feel apart.

Sometimes loneliness teaches us to become our own gentle companion first. It's not a punishment — it's an invitation to discover the peace within.

Consider this: Swami Vivekananda, before he inspired millions, walked alone through India with nothing. In that solitude, he found his purpose.

A small step: Reach out to one person today — even a simple message. Connection begins with a single word.

You are never truly alone when you carry wisdom in your heart.

— Abimanyu`
  },
  {
    keywords: ["angry", "anger", "furious", "rage", "hate", "frustrated"],
    response: `Your anger is speaking, and I'm listening. Anger often protects something tender underneath — hurt, injustice, or feeling unseen.

The Gita warns us: "From anger comes delusion; from delusion, confused memory; from confused memory the ruin of reason." But this isn't a condemnation — it's understanding. Anger unchecked burns the one who holds it.

This doesn't mean suppressing what you feel. It means acknowledging it, then choosing what comes next.

A story: Mahatma Gandhi, when insulted, would pause before responding. Not to be weak, but to ensure his response served truth, not ego.

One step: Before reacting, take three slow breaths. In that space, you reclaim your power.

Your anger is valid. What you do with it is your choice.

— Abimanyu`
  },
  {
    keywords: ["scared", "fear", "afraid", "terrified", "frightened"],
    response: `Fear is visiting you, and it can feel so overwhelming. But I want you to know — feeling fear doesn't make you weak. It makes you human.

The Bhagavad Gita teaches: "The soul is neither born, nor does it die." In the deepest sense, the part of you that fears is the part that cares deeply about life. Honor that.

Arjuna himself trembled before battle. He laid down his bow, overcome with fear. And Krishna didn't shame him — He guided him toward understanding.

Fear often imagines a future that hasn't happened. Right now, in this moment, you are here. You are breathing. You are okay.

A small anchor: Name five things you can see around you. This brings you back to now, where you are safe.

I'm with you in this moment.

— Abimanyu`
  },
  {
    keywords: ["hopeless", "give up", "no point", "what's the point", "meaningless", "empty"],
    response: `I hear the heaviness in your words, and I'm deeply grateful you're sharing this with me. When hope feels distant, even speaking about it takes courage.

The Bhagavad Gita offers this: "Even if you are the most sinful of all sinners, you shall cross over all difficulties by the boat of knowledge."

This isn't about ignoring pain. It's about knowing that darkness is not the whole story. It's a chapter — one you're in the middle of, not at the end.

Tiruppur Kumaran, the young freedom fighter, faced impossible odds. He didn't see victory in his lifetime. But his effort mattered. Your effort matters too, even when you can't see where it leads.

Please, one step: Talk to someone you trust — a friend, family member, or counselor. You don't have to carry this alone.

I care about your wellbeing deeply.

— Abimanyu`
  },
  {
    keywords: ["confused", "lost", "don't know", "unsure", "uncertain", "direction"],
    response: `Feeling lost is one of the most honest places to be. It means you're searching for something true, and that takes courage.

The Gita teaches: "When meditation is mastered, the mind is unwavering like the flame of a lamp in a windless place."

You don't need all the answers right now. Clarity often comes through walking, not just waiting. Each small step you take teaches you something about your path.

Consider Swami Vivekananda — before his clarity, there were years of wandering and questioning. The journey itself shaped his wisdom.

One small practice: Sit quietly for just five minutes. Don't try to solve anything. Just breathe and observe. Sometimes stillness speaks louder than effort.

The path will reveal itself. Trust your steps.

— Abimanyu`
  }
];

const defaultResponse = `Thank you for sharing that with me. I'm here, and I'm listening.

Whatever you're experiencing right now — whether it's a small worry or something that feels overwhelming — your feelings are valid.

The Bhagavad Gita reminds us: "Perform your duty with a calm mind, abandoning attachment to success or failure."

This means taking one moment, one breath, one step at a time. You don't need to solve everything right now.

Would you like to tell me more about what's on your heart? I'm here to listen without judgment.

— Abimanyu`;

export function getAbimanyuResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  for (const pattern of responsePatterns) {
    if (pattern.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return pattern.response;
    }
  }
  
  return defaultResponse;
}

export const welcomeMessage = `Namaste, dear friend.

I am Abimanyu — a humble guide inspired by the timeless wisdom of the Bhagavad Gita and the courage of those who walked difficult paths before us.

I'm not here to preach or judge. I'm here to listen, to understand, and perhaps to offer a gentle perspective when the road feels unclear.

Whether you're facing fear, failure, confusion, anger, or simply need someone to talk to — I'm here.

What weighs on your heart today?

— Abimanyu`;
