// src/data/breeds.ts
// VuraPet Breed Intelligence Data
// Structure kept API-ready: swap getBreedData() for an async API call later

export type EnergyLevel = 'Low' | 'Medium' | 'High' | 'Very High';
export type MatchVerdict = 'Strong Match' | 'Moderate Match' | 'High Risk Match';

export interface RiskFlag {
  id: string;
  title: string;
  consequence: string;
}

export interface BreedCharacteristic {
  label: string;
  score: number;
  note: string;
}

export interface BreedProfile {
  name: string;
  species: 'dog' | 'cat';
  energy_level: EnergyLevel;
  tagline: string;
  temperament: string;
  good_with: string[];
  not_for: string[];
  risk_flags: RiskFlag[];
  characteristics: BreedCharacteristic[];
  guardian_note: string;
  lifespan: string;
  weight: string;
  hook: string;
}

export interface MatchQuestion {
  id: string;
  question: string;
  options: { label: string; value: string; weight: number }[];
}

// Match questions — breed-agnostic, used for scoring
export const matchQuestions: MatchQuestion[] = [
  {
    id: 'exercise',
    question: 'Can you commit to daily physical AND mental exercise?',
    options: [
      { label: 'Yes — 2+ hours daily, no excuses', value: 'high', weight: 100 },
      { label: 'Mostly — about 1 hour on weekdays', value: 'medium', weight: 60 },
      { label: 'Occasionally — weekends when I can', value: 'low', weight: 20 },
    ],
  },
  {
    id: 'environment',
    question: "What's your home environment like?",
    options: [
      { label: 'House with a large yard', value: 'large', weight: 100 },
      { label: 'House with a small yard or garden', value: 'medium', weight: 70 },
      { label: 'Apartment or flat', value: 'apartment', weight: 30 },
    ],
  },
  {
    id: 'experience',
    question: "What's your dog ownership experience?",
    options: [
      { label: 'Experienced — owned and trained dogs before', value: 'experienced', weight: 100 },
      { label: 'Some experience — had a dog growing up', value: 'some', weight: 65 },
      { label: 'First-time owner', value: 'none', weight: 30 },
    ],
  },
];

// Scoring weights per question (must total 1.0)
export const questionWeights: Record<string, number> = {
  exercise: 0.5,    // highest weight — exercise is make-or-break
  environment: 0.25,
  experience: 0.25,
};

export function calculateMatchScore(answers: Record<string, number>): number {
  let total = 0;
  for (const [questionId, weight] of Object.entries(questionWeights)) {
    total += (answers[questionId] ?? 0) * weight;
  }
  return Math.round(total);
}

export function getVerdict(score: number): MatchVerdict {
  if (score >= 75) return 'Strong Match';
  if (score >= 50) return 'Moderate Match';
  return 'High Risk Match';
}

export function getVerdictColor(score: number): string {
  if (score >= 75) return '#22c55e';
  if (score >= 50) return '#f97316';
  return '#ef4444';
}

export function getGuardianVoice(score: number, breedName: string): string {
  if (score >= 75) {
    return `Analysis complete. Your lifestyle is a rare match for a ${breedName}. You have the structure, space, and experience this breed craves. Stay consistent and you'll have an extraordinary companion.`;
  }
  if (score >= 50) {
    return `Warning: friction detected. You have the heart for a ${breedName}, but your current schedule will create a bored, frustrated dog. Without a clear daily plan, this becomes a battle — not a bond.`;
  }
  return `Critical alert: this breed is likely to overwhelm your current environment. A ${breedName} without structure doesn't just become difficult — it becomes a crisis. Before committing, you need a serious plan.`;
}

// ─── DOG BREEDS (15) ────────────────────────────────────────────────────────

const dogBreeds: BreedProfile[] = [
  {
    name: 'German Shepherd',
    species: 'dog',
    energy_level: 'Very High',
    tagline: 'Loyal. Demanding. Transformative.',
    temperament: 'Highly intelligent, fiercely loyal, and intensely driven. This breed needs a job — without one, it creates its own.',
    good_with: ['Active singles or families', 'People who work from home', 'Those open to ongoing training', 'Experienced handlers'],
    not_for: ['Apartment living without 2+ hours outdoor time', 'Owners away 8+ hours daily', 'Those wanting a low-maintenance dog'],
    hook: 'Are you actually ready for a German Shepherd?',
    characteristics: [
      { label: 'Intelligence', score: 97, note: 'Top 3 globally — needs daily challenge' },
      { label: 'Exercise Need', score: 95, note: '2+ hours daily, minimum' },
      { label: 'Grooming Load', score: 72, note: 'Sheds heavily twice a year, lightly always' },
      { label: 'Child Safety', score: 85, note: 'Excellent with proper early socialisation' },
    ],
    risk_flags: [
      { id: 'boredom', title: 'Boredom Destruction', consequence: 'If under-stimulated, this dog will destroy furniture, shoes, and anything it can reach. A bored German Shepherd is not a nuisance — it\'s a wrecking ball.' },
      { id: 'separation', title: 'Separation Anxiety', consequence: 'Left alone for long periods, this breed develops severe anxiety. Barking, scratching, and self-harm are common. This dog needs a human presence.' },
      { id: 'dominance', title: 'Dominance Testing', consequence: 'Without a confident, consistent owner, this breed will test and eventually take control of the household. Training is not optional — it\'s survival.' },
    ],
    guardian_note: "If you don't give this dog a job, it will find one — and you probably won't like it. This isn't a casual pet. It's a commitment that will either transform your life or overwhelm it. The difference is entirely up to you.",
    lifespan: '9–13 years',
    weight: '22–40 kg',
  },
  {
    name: 'Golden Retriever',
    species: 'dog',
    energy_level: 'High',
    tagline: 'Joyful. Gentle. Forgiving.',
    temperament: 'Eager to please, deeply social, and endlessly patient. One of the most adaptable family breeds — but still needs consistent exercise and engagement.',
    good_with: ['Families with children', 'First-time owners', 'Multi-pet households', 'Active retirees'],
    not_for: ['Those wanting a guard dog', 'Owners unable to commit to daily walks', 'People with severe allergies'],
    hook: 'Is a Golden Retriever actually right for your family?',
    characteristics: [
      { label: 'Intelligence', score: 85, note: 'Highly trainable — loves to learn' },
      { label: 'Exercise Need', score: 80, note: '1–2 hours daily recommended' },
      { label: 'Grooming Load', score: 78, note: 'Heavy shedder — brushing 3x weekly minimum' },
      { label: 'Child Safety', score: 98, note: 'One of the safest breeds with children' },
    ],
    risk_flags: [
      { id: 'weight_entries', title: 'Obesity Risk', consequence: 'Golden Retrievers will eat until they\'re ill. Without portion control and daily exercise, weight gain becomes a serious joint and health issue within 2 years.' },
      { id: 'shedding', title: 'Heavy Shedding', consequence: 'Golden fur will be in your food, on your clothes, and embedded in your furniture. Year-round shedding with two peak seasons that will test your patience.' },
      { id: 'health', title: 'Cancer Risk', consequence: 'This breed has one of the highest cancer rates of any dog — nearly 60% will develop some form. Health insurance is not optional. Vet bills can reach tens of thousands.' },
    ],
    guardian_note: "The Golden Retriever's greatest strength is also its trap — it forgives neglect quietly, right up until it breaks. Don't mistake its patience for low maintenance. It deserves more than it ever demands.",
    lifespan: '10–12 years',
    weight: '25–34 kg',
  },
  {
    name: 'French Bulldog',
    species: 'dog',
    energy_level: 'Low',
    tagline: 'Charming. Stubborn. Expensive.',
    temperament: 'Affectionate, comical, and surprisingly strong-willed. Adapts well to apartment life but comes with a long list of health considerations that most owners discover too late.',
    good_with: ['City dwellers', 'Couples', 'Seniors', 'Those with limited outdoor space'],
    not_for: ['Hot climates without AC', 'Owners who travel frequently', 'Budget-conscious owners'],
    hook: 'Before you fall for the face — know what a French Bulldog actually costs.',
    characteristics: [
      { label: 'Intelligence', score: 55, note: 'Intelligent but chooses when to listen' },
      { label: 'Exercise Need', score: 35, note: '20–30 min daily — overheating is a real risk' },
      { label: 'Grooming Load', score: 25, note: 'Low shedding, but facial folds need daily cleaning' },
      { label: 'Child Safety', score: 82, note: 'Generally good — supervise with toddlers' },
    ],
    risk_flags: [
      { id: 'breathing', title: 'Breathing Difficulties', consequence: 'Brachycephalic syndrome means this dog can\'t breathe properly. Heat, stress, or overexertion can become emergencies. Some require surgery just to live comfortably.' },
      { id: 'cost', title: 'Extreme Vet Costs', consequence: 'French Bulldogs have among the highest lifetime vet costs of any breed. Spine issues, allergies, and breathing surgeries are common. Budget R3,000–R8,000+ per incident.' },
      { id: 'travel', title: 'Cannot Fly Safely', consequence: 'Most airlines ban French Bulldogs in cargo — they die. Even cabin travel is high risk. If you travel, this breed needs a permanent, trusted local caretaker.' },
    ],
    guardian_note: "The French Bulldog doesn't warn you about what's coming. It just smiles at you while the vet bills pile up. Love them with open eyes — and an open wallet.",
    lifespan: '10–12 years',
    weight: '8–13 kg',
  },
  {
    name: 'Border Collie',
    species: 'dog',
    energy_level: 'Very High',
    tagline: 'Brilliant. Relentless. Misunderstood.',
    temperament: 'The most intelligent dog breed on earth — and the most demanding. Without a daily purpose, this dog will herd your children, chase your cats, and outsmart your attempts to contain it.',
    good_with: ['Active outdoor enthusiasts', 'Experienced trainers', 'Farmers or people with land', 'Dog sport competitors'],
    not_for: ['Apartment dwellers', 'Casual owners', 'Families with very young children', 'Anyone without 3+ hours daily'],
    hook: 'The world\'s smartest dog — or your biggest mistake?',
    characteristics: [
      { label: 'Intelligence', score: 100, note: 'Ranked #1 globally — learns commands in under 5 repetitions' },
      { label: 'Exercise Need', score: 98, note: 'Minimum 3 hours physical + mental stimulation daily' },
      { label: 'Grooming Load', score: 60, note: 'Moderate shedding — weekly brushing required' },
      { label: 'Child Safety', score: 65, note: 'Will herd small children — early socialisation critical' },
    ],
    risk_flags: [
      { id: 'obsession', title: 'Obsessive Behaviour', consequence: 'Without a job, Border Collies develop fixations — on lights, shadows, balls, or movement. This becomes a compulsive disorder that\'s very difficult to reverse.' },
      { id: 'herding', title: 'Herding Instinct', consequence: 'This dog will attempt to herd children, other pets, and even adults. Nipping is instinctive, not aggressive — but it terrifies kids and visitors.' },
      { id: 'mental', title: 'Mental Health Decline', consequence: 'A bored Border Collie doesn\'t just become destructive — it becomes neurotic. Anxiety, pacing, and self-harm are the result of an under-stimulated genius.' },
    ],
    guardian_note: "This is not a pet. It's a working partner that happens to live in your house. If you can't give it a job, purpose, and 3+ hours a day — you're not getting a dog. You're getting a burden.",
    lifespan: '12–15 years',
    weight: '14–20 kg',
  },
  {
    name: 'Labrador Retriever',
    species: 'dog',
    energy_level: 'High',
    tagline: 'Loyal. Enthusiastic. Eternally hungry.',
    temperament: 'One of the most family-friendly breeds ever bred. Labs are eager, trainable, and endlessly enthusiastic — but their high energy and food obsession require structure from day one.',
    good_with: ['Families with children', 'Active owners', 'First-time owners with commitment', 'Multi-pet households'],
    not_for: ['Sedentary lifestyles', 'Anyone who can\'t handle strong pulling on lead', 'Those who don\'t want dog hair everywhere'],
    hook: 'The world\'s favourite dog — but are you ready for what that actually means?',
    characteristics: [
      { label: 'Intelligence', score: 80, note: 'Highly trainable — food motivated' },
      { label: 'Exercise Need', score: 85, note: '1.5–2 hours daily essential' },
      { label: 'Grooming Load', score: 65, note: 'Double coat sheds year-round' },
      { label: 'Child Safety', score: 95, note: 'Exceptional — gentle and patient' },
    ],
    risk_flags: [
      { id: 'weight_entries', title: 'Obesity Crisis', consequence: 'Labradors have a genetic mutation that removes the sensation of fullness. They will eat until they are sick — and their joints will pay the price within 3–5 years without strict portion control.' },
      { id: 'joints', title: 'Hip Dysplasia', consequence: 'One of the most hip-dysplasia-prone breeds. Without proper weight management and controlled exercise as a puppy, arthritis and surgery become inevitable conversations.' },
      { id: 'energy', title: 'Destructive Youth', consequence: 'Labs remain mentally "puppy" until age 3. Two years of high energy, poor impulse control, and zero self-awareness. Furniture, shoes, and gardens are at risk.' },
    ],
    guardian_note: "A Labrador will love you unconditionally, eat your dinner, and destroy your garden — all in the same afternoon. Structure them early or spend years managing the chaos. They are worth every second of it.",
    lifespan: '10–12 years',
    weight: '25–36 kg',
  },
  {
    name: 'Siberian Husky',
    species: 'dog',
    energy_level: 'Very High',
    tagline: 'Wild. Beautiful. Escape artist.',
    temperament: 'Built for endurance across frozen tundra. In a suburban home, that same drive becomes a containment problem, a noise problem, and an exercise problem — all at once.',
    good_with: ['Very active owners', 'Cold climate households', 'Experienced dog owners', 'Runners or cyclists'],
    not_for: ['Hot climates', 'Apartment dwellers', 'People who value a quiet home', 'Those with small pets'],
    hook: 'A Husky is stunning — until it howls at 2am and escapes your garden.',
    characteristics: [
      { label: 'Intelligence', score: 70, note: 'Smart but independent — trains on their terms' },
      { label: 'Exercise Need', score: 97, note: 'Born to run 80km+ a day — 2–3 hours minimum' },
      { label: 'Grooming Load', score: 85, note: 'Blows coat twice yearly — fur everywhere' },
      { label: 'Child Safety', score: 75, note: 'Generally good — prey drive can be triggered' },
    ],
    risk_flags: [
      { id: 'escape', title: 'Escape Artist', consequence: 'Huskies climb fences, dig under gates, and slip collars. A standard suburban fence is a puzzle, not a barrier. Lost Husky incidents are extremely common.' },
      { id: 'howling', title: 'Excessive Vocalisation', consequence: 'This breed communicates through howling — and it carries. Neighbours will hear. If you\'re in a complex or close-quarter housing, this will cause serious conflict.' },
      { id: 'prey', title: 'High Prey Drive', consequence: 'Cats, rabbits, and small dogs are at genuine risk in a multi-pet home with an unsupervised Husky. The instinct is deeply wired — it cannot be fully trained out.' },
    ],
    guardian_note: "A Husky will make you feel alive — and exhausted. It will test every fence, every lock, and every limit you set. If that sounds like a challenge you're ready for, you'll have a companion unlike any other.",
    lifespan: '12–14 years',
    weight: '16–27 kg',
  },
  {
    name: 'Rottweiler',
    species: 'dog',
    energy_level: 'High',
    tagline: 'Powerful. Protective. Misrepresented.',
    temperament: 'One of the most loyal and trainable working breeds. When raised correctly, Rottweilers are calm, confident, and deeply bonded. When raised incorrectly, they are a serious liability.',
    good_with: ['Experienced owners', 'Households without young children', 'People committed to ongoing training', 'Single-pet homes'],
    not_for: ['First-time owners', 'Passive or inconsistent handlers', 'Small living spaces', 'Owners who travel frequently'],
    hook: 'A Rottweiler is only as good as the owner who raises it.',
    characteristics: [
      { label: 'Intelligence', score: 88, note: 'Highly capable — responds to firm, consistent training' },
      { label: 'Exercise Need', score: 82, note: '1.5–2 hours daily plus mental stimulation' },
      { label: 'Grooming Load', score: 30, note: 'Low maintenance coat — minimal shedding' },
      { label: 'Child Safety', score: 60, note: 'Good with family children — caution with strangers\' kids' },
    ],
    risk_flags: [
      { id: 'liability', title: 'Legal Liability', consequence: 'In many areas, Rottweilers are breed-restricted. Insurance can be denied or voided. A single incident — even a misread situation — can result in your dog being destroyed.' },
      { id: 'dominance', title: 'Dominance Without Structure', consequence: 'Without a calm, assertive owner who trains consistently, a Rottweiler will fill the leadership vacuum itself. This is when the danger begins.' },
      { id: 'health', title: 'Joint & Heart Issues', consequence: 'Prone to hip dysplasia, aortic stenosis, and osteosarcoma. Lifetime vet costs can be significant — health screening before purchase is essential.' },
    ],
    guardian_note: "The Rottweiler is not the problem. The problem is owners who want the image without doing the work. Raise this dog with structure, socialisation, and respect — and you will have one of the finest companions you've ever known.",
    lifespan: '8–10 years',
    weight: '35–60 kg',
  },
  {
    name: 'Beagle',
    species: 'dog',
    energy_level: 'Medium',
    tagline: 'Curious. Stubborn. Nose-first.',
    temperament: 'A scent hound through and through. Beagles are cheerful and social, but their nose overrides their brain — and their recall — the moment something interesting crosses their path.',
    good_with: ['Families', 'Multi-dog households', 'Active children', 'Suburban homes with secure gardens'],
    not_for: ['Off-lead in open spaces', 'Owners who need a quiet dog', 'Those without secure fencing', 'Anyone expecting instant obedience'],
    hook: 'Adorable, yes — but a Beagle\'s nose will test your patience every single day.',
    characteristics: [
      { label: 'Intelligence', score: 60, note: 'Smart — but scent-driven logic overrides training' },
      { label: 'Exercise Need', score: 70, note: '1–1.5 hours daily — mental sniff time critical' },
      { label: 'Grooming Load', score: 35, note: 'Short coat — low maintenance, moderate shedding' },
      { label: 'Child Safety', score: 90, note: 'One of the best with children — patient and playful' },
    ],
    risk_flags: [
      { id: 'recall', title: 'Zero Recall Off-Lead', consequence: 'Once a Beagle locks onto a scent, you cease to exist. They have been found miles from home, oblivious and happy. Never off-lead in an unsecured area.' },
      { id: 'howling', title: 'Baying and Howling', consequence: 'Beagles were bred to signal finds with their voice. In a quiet neighbourhood, this becomes a noise complaint waiting to happen — especially when left alone.' },
      { id: 'weight_entries', title: 'Obesity Prone', consequence: 'Beagles are deeply food-motivated and will overeat without restriction. Obesity-related joint problems are common in the breed — strict feeding schedules matter.' },
    ],
    guardian_note: "A Beagle will follow its nose off a cliff and look back at you like it was your idea. That same curiosity and joy is what makes living with one so unexpectedly wonderful — if you can laugh at the chaos.",
    lifespan: '12–15 years',
    weight: '9–11 kg',
  },
  {
    name: 'Poodle (Standard)',
    species: 'dog',
    energy_level: 'High',
    tagline: 'Elegant. Athletic. Deeply intelligent.',
    temperament: 'Beneath the aesthetic is a working retriever — athletic, sharp, and deeply sensitive. The Poodle is the combination of a serious working dog and a loyal companion that most people completely underestimate.',
    good_with: ['Active families', 'Allergy sufferers', 'People who enjoy training', 'Multi-pet households'],
    not_for: ['Those who can\'t commit to regular grooming', 'Sedentary lifestyles', 'Anyone who dismisses training as optional'],
    hook: 'People dismiss Poodles. The ones who own them know better.',
    characteristics: [
      { label: 'Intelligence', score: 95, note: 'Top 2 globally — learns with extraordinary speed' },
      { label: 'Exercise Need', score: 80, note: '1.5–2 hours daily — mentally and physically' },
      { label: 'Grooming Load', score: 90, note: 'Professional grooming every 6–8 weeks — non-negotiable' },
      { label: 'Child Safety', score: 92, note: 'Excellent — intuitive with children\'s energy' },
    ],
    risk_flags: [
      { id: 'grooming', title: 'Grooming Cost', consequence: 'Professional grooming every 6–8 weeks is non-negotiable. Without it, the coat mats painfully close to the skin. Annual grooming costs can exceed R6,000+.' },
      { id: 'anxiety', title: 'Emotional Sensitivity', consequence: 'Poodles absorb the emotional atmosphere of the home. Conflict, instability, or extended isolation leads to anxiety-driven behaviours that can be difficult to reverse.' },
      { id: 'health', title: 'Genetic Health Issues', consequence: 'Addison\'s disease, hip dysplasia, and bloat are breed concerns. Health-tested breeding lines matter — a cheap Poodle often means expensive vet bills.' },
    ],
    guardian_note: "The Poodle will be the most intelligent thing in most rooms it enters. Your job is to give that mind something worthy to do — because if you don't, it will find its own entertainment, and it will be creative.",
    lifespan: '12–15 years',
    weight: '20–32 kg',
  },
  {
    name: 'Dachshund',
    species: 'dog',
    energy_level: 'Medium',
    tagline: 'Bold. Tenacious. Fragile-spined.',
    temperament: 'A fearless hunter in a small body. Dachshunds are charming, stubborn, and deeply loyal — but their iconic shape comes with serious structural vulnerabilities that every owner must understand.',
    good_with: ['Apartment dwellers', 'Singles or couples', 'Quieter homes', 'Owners who enjoy personality'],
    not_for: ['Homes with stairs everywhere', 'Rough play with young children', 'Anyone who won\'t manage their weight carefully'],
    hook: 'The back problems aren\'t a maybe. They\'re a when.',
    characteristics: [
      { label: 'Intelligence', score: 65, note: 'Clever and independent — trains on their schedule' },
      { label: 'Exercise Need', score: 50, note: '30–45 min daily — no jumping or stairs' },
      { label: 'Grooming Load', score: 30, note: 'Smooth coat is minimal — wire/long coat needs more' },
      { label: 'Child Safety', score: 60, note: 'Better with older children who understand boundaries' },
    ],
    risk_flags: [
      { id: 'spine', title: 'IVDD Spinal Disease', consequence: 'Up to 25% of Dachshunds will develop intervertebral disc disease. A single wrong jump from the couch can result in paralysis. Surgery costs R40,000–R100,000+.' },
      { id: 'weight_entries', title: 'Weight is Life-Threatening', consequence: 'Extra weight on that elongated spine accelerates disc damage dramatically. Even 1–2kg overweight meaningfully shortens their mobile years.' },
      { id: 'barking', title: 'Excessive Barking', consequence: 'Dachshunds were bred to alert. Everything is a threat worth barking at — postmen, bicycles, other dogs, leaves. Apartment neighbours will notice.' },
    ],
    guardian_note: "A Dachshund will act like a Rottweiler and expect to be treated like royalty — simultaneously. Love them fiercely, watch their weight obsessively, and keep them off the furniture. Their spine depends on it.",
    lifespan: '12–16 years',
    weight: '7–14 kg',
  },
  {
    name: 'Shih Tzu',
    species: 'dog',
    energy_level: 'Low',
    tagline: 'Regal. Affectionate. High-maintenance.',
    temperament: 'Bred exclusively as a companion, the Shih Tzu has perfected the art of being adored. What it lacks in athleticism, it compensates for in personality — and grooming requirements.',
    good_with: ['Seniors', 'Apartment dwellers', 'Singles or couples', 'Less active households'],
    not_for: ['Owners who can\'t commit to daily grooming', 'Hot climates without air conditioning', 'Highly active owners'],
    hook: 'Beautiful coat. Serious grooming commitment. Are you ready?',
    characteristics: [
      { label: 'Intelligence', score: 55, note: 'Trainable but strong-willed — patience required' },
      { label: 'Exercise Need', score: 30, note: '20–30 min daily walks — heat sensitive' },
      { label: 'Grooming Load', score: 95, note: 'Daily brushing non-negotiable — professional grooming monthly' },
      { label: 'Child Safety', score: 75, note: 'Good with gentle children — fragile with rough play' },
    ],
    risk_flags: [
      { id: 'grooming', title: 'Grooming Neglect = Suffering', consequence: 'An unbrushed Shih Tzu coat mats within days. Severe matting pulls constantly at the skin and requires full shaving under sedation. This is animal welfare, not aesthetics.' },
      { id: 'breathing', title: 'Brachycephalic Breathing', consequence: 'Like all flat-faced breeds, Shih Tzus struggle in heat and stress. Exercise in heat can escalate to emergency within minutes.' },
      { id: 'eyes', title: 'Eye Injuries', consequence: 'Their prominent eyes are constantly exposed. Scratches, ulcers, and infections are common. Eye emergencies can happen without warning.' },
    ],
    guardian_note: "The Shih Tzu asks for very little in the way of exercise — but its coat demands daily devotion. Commit to the grooming routine and you\'ll have one of the most loyal, joyful companions imaginable. Neglect it and you\'ll have a suffering dog.",
    lifespan: '10–16 years',
    weight: '4–7 kg',
  },
  {
    name: 'Boxer',
    species: 'dog',
    energy_level: 'High',
    tagline: 'Playful. Loyal. Perpetually puppyish.',
    temperament: 'Boxers are the clowns of the dog world — endlessly enthusiastic, deeply loyal, and completely unaware of their size. They stay mentally adolescent until age 3 and need consistent exercise to channel that energy.',
    good_with: ['Active families', 'Children who can handle boisterous play', 'Experienced owners', 'Those with space to run'],
    not_for: ['Hot climates', 'Sedentary households', 'Those who want a calm, quiet dog'],
    hook: 'A Boxer will knock you over with love — literally.',
    characteristics: [
      { label: 'Intelligence', score: 72, note: 'Willing learner — responds to positive reinforcement' },
      { label: 'Exercise Need', score: 85, note: '1.5–2 hours daily — young Boxers need even more' },
      { label: 'Grooming Load', score: 20, note: 'Minimal — short coat, average shedding' },
      { label: 'Child Safety', score: 80, note: 'Great with kids — size and exuberance can knock toddlers' },
    ],
    risk_flags: [
      { id: 'health', title: 'Heart Conditions', consequence: 'Boxers have one of the highest rates of heart disease of any breed — Boxer Cardiomyopathy can cause sudden cardiac death. Annual cardiac screening is essential.' },
      { id: 'cancer', title: 'High Cancer Rate', consequence: 'Among the most cancer-prone breeds. Brain tumours and mast cell tumours are particularly common. Budget for comprehensive health cover.' },
      { id: 'heat', title: 'Heat Intolerance', consequence: 'Like all brachycephalic breeds, Boxers overheat rapidly. Summer exercise must happen at dawn or dusk. Hot pavement, hot cars, and midday heat are genuine dangers.' },
    ],
    guardian_note: "A Boxer will be the most enthusiastic thing in your life — greeting you like you\'ve been gone for years, every single time. Just keep them cool, keep their heart checked, and hold on tight.",
    lifespan: '10–12 years',
    weight: '25–32 kg',
  },
  {
    name: 'Maltese',
    species: 'dog',
    energy_level: 'Low',
    tagline: 'Elegant. Spirited. Surprisingly fierce.',
    temperament: 'Don\'t be fooled by the silk coat and toy size — the Maltese has the confidence of a much larger dog. Affectionate and alert, they thrive in calm environments but will tell you exactly what they think.',
    good_with: ['Seniors', 'Apartment dwellers', 'Couples or singles', 'Those who enjoy lap dogs'],
    not_for: ['Rough play with young children', 'Owners who can\'t groom daily', 'Those who want an independent dog'],
    hook: 'Tiny dog. Giant personality. Non-negotiable grooming.',
    characteristics: [
      { label: 'Intelligence', score: 65, note: 'Smart and aware — but stubborn on their terms' },
      { label: 'Exercise Need', score: 25, note: '20 min daily walks sufficient' },
      { label: 'Grooming Load', score: 92, note: 'Daily brushing essential — professional grooming monthly' },
      { label: 'Child Safety', score: 55, note: 'Fragile — rough handling can cause injury' },
    ],
    risk_flags: [
      { id: 'fragility', title: 'Physical Fragility', consequence: 'A dropped Maltese, a rough child, or an accidental step can cause serious injury. Their delicate bone structure is not compatible with chaotic environments.' },
      { id: 'dental', title: 'Severe Dental Disease', consequence: 'Small jaws, crowded teeth, and rapid tartar build-up make dental disease almost inevitable without daily brushing and regular professional cleaning.' },
      { id: 'sepanx', title: 'Velcro Dog Syndrome', consequence: 'Maltese bond intensely. Left alone for long periods, they develop severe separation anxiety — destructive, vocal, and deeply distressing for the dog.' },
    ],
    guardian_note: "The Maltese is not a decorative dog. It\'s a relationship. It will follow you, need you, and remind you constantly that you are its entire world. That is either beautiful or overwhelming — only you know which.",
    lifespan: '12–15 years',
    weight: '2–4 kg',
  },
  {
    name: 'Australian Shepherd',
    species: 'dog',
    energy_level: 'Very High',
    tagline: 'Agile. Intelligent. Always on.',
    temperament: 'A working herding dog that never got the memo about retirement. Australian Shepherds are brilliant, driven, and deeply bonded — but they require a level of engagement that most owners severely underestimate.',
    good_with: ['Active outdoor lifestyles', 'Dog sport enthusiasts', 'Families with older children', 'Experienced handlers'],
    not_for: ['Apartment living', 'Owners working long hours', 'Sedentary lifestyles', 'Casual owners'],
    hook: 'If you think you can out-stubborn an Aussie, think again.',
    characteristics: [
      { label: 'Intelligence', score: 92, note: 'Top 5 globally — needs complex daily challenges' },
      { label: 'Exercise Need', score: 95, note: '2–3 hours daily minimum — mental + physical' },
      { label: 'Grooming Load', score: 68, note: 'Medium coat sheds moderately — brushing twice weekly' },
      { label: 'Child Safety', score: 72, note: 'Good — herding instinct can startle young children' },
    ],
    risk_flags: [
      { id: 'herding', title: 'Compulsive Herding', consequence: 'Australian Shepherds will attempt to herd anything that moves — children, cats, guests. Without an outlet, this instinct becomes obsessive and impossible to manage.' },
      { id: 'boredom', title: 'Genius-Level Boredom', consequence: 'An under-stimulated Aussie doesn\'t just bark or chew — it develops complex, creative destruction strategies. They will find the one thing you forgot to secure.' },
      { id: 'mdr1', title: 'Drug Sensitivity (MDR1)', consequence: 'Many Australian Shepherds carry a gene mutation that makes common medications — including some dewormers and anaesthetics — potentially fatal. DNA testing before any vet procedure is critical.' },
    ],
    guardian_note: "An Australian Shepherd will make you a better, more active, more consistent person — whether you want to be or not. They don\'t accept excuses. Give them purpose and they\'ll give you everything.",
    lifespan: '12–15 years',
    weight: '16–32 kg',
  },
  {
    name: 'Dobermann',
    species: 'dog',
    energy_level: 'High',
    tagline: 'Fearless. Devoted. Misunderstood.',
    temperament: 'Engineered as the ultimate protection dog, the Dobermann is one of the most loyal, sensitive, and trainable breeds in existence. Its reputation for aggression is almost entirely the result of poor ownership.',
    good_with: ['Experienced owners', 'Active households', 'Single-pet homes', 'Those committed to training'],
    not_for: ['First-time owners', 'Passive handlers', 'Homes with frequent strangers', 'Those in cold climates'],
    hook: 'A Dobermann isn\'t dangerous. An untrained Dobermann is.',
    characteristics: [
      { label: 'Intelligence', score: 90, note: 'Top 5 globally — lightning-fast learner' },
      { label: 'Exercise Need', score: 88, note: '2 hours daily — mental + physical essential' },
      { label: 'Grooming Load', score: 15, note: 'Short coat — minimal grooming, cold sensitive' },
      { label: 'Child Safety', score: 70, note: 'Excellent with family children — caution with strangers\'' },
    ],
    risk_flags: [
      { id: 'heart', title: 'Dilated Cardiomyopathy', consequence: 'DCM affects up to 50% of Dobermanns. This heart condition can cause sudden death with no prior symptoms. Annual cardiac ultrasound is not optional — it\'s responsible ownership.' },
      { id: 'dominance', title: 'Pack Leadership Required', consequence: 'A Dobermann without a confident, consistent leader will take the role itself. Instability in leadership creates instability in the dog — and that becomes dangerous quickly.' },
      { id: 'cold', title: 'Cold Sensitivity', consequence: 'With almost no body fat and a single-layer coat, Dobermanns suffer in cold weather. Outdoor kennelling in South African winters is inappropriate — they are house dogs.' },
    ],
    guardian_note: "The Dobermann is the most misunderstood breed in the world. What people call dangerous, experienced owners call devoted. Train it. Bond with it. Respect it. And it will protect you with every fibre of its being.",
    lifespan: '10–13 years',
    weight: '32–45 kg',
  },
];

// ─── CAT BREEDS (10) ────────────────────────────────────────────────────────

const catBreeds: BreedProfile[] = [
  {
    name: 'Maine Coon',
    species: 'cat',
    energy_level: 'Medium',
    tagline: 'Majestic. Gentle. Dog-like loyalty.',
    temperament: 'The gentle giant of the cat world. Maine Coons are social, playful, and deeply curious — forming genuine bonds with their families rather than simply tolerating them.',
    good_with: ['Families with children', 'Dog owners', 'Multi-pet households', 'Those who want an interactive cat'],
    not_for: ['People expecting a low-maintenance cat', 'Those who can\'t commit to weekly grooming', 'Small apartments long-term'],
    hook: 'A Maine Coon isn\'t just a cat. It\'s a presence.',
    characteristics: [
      { label: 'Social Need', score: 82, note: 'Highly social — doesn\'t do well alone all day' },
      { label: 'Energy Level', score: 65, note: 'Playful into adulthood — needs interactive toys' },
      { label: 'Grooming Load', score: 75, note: 'Semi-long coat — weekly brushing minimum' },
      { label: 'Vocality', score: 45, note: 'Chirps and trills rather than yowls' },
    ],
    risk_flags: [
      { id: 'hcm', title: 'Heart Disease (HCM)', consequence: 'Hypertrophic cardiomyopathy is the leading cause of death in Maine Coons. Annual cardiac screening from age 2 can catch it early — but it\'s not curable, only managed.' },
      { id: 'size', title: 'Size-Related Joint Issues', consequence: 'Maine Coons keep growing until age 4–5. Their weight puts significant stress on joints — obesity dramatically accelerates joint problems in this breed.' },
      { id: 'grooming', title: 'Matting and Coat Neglect', consequence: 'A neglected Maine Coon coat mats severely. Severe matting requires sedation to remove and causes constant skin discomfort. Weekly brushing is non-negotiable.' },
    ],
    guardian_note: "A Maine Coon will follow you from room to room, supervise your work, and chirp at you when it has opinions — which is often. This is not a cat that tolerates being ignored. Engage with it and you\'ll wonder how you lived without one.",
    lifespan: '12–15 years',
    weight: '4–8 kg',
  },
  {
    name: 'Siamese',
    species: 'cat',
    energy_level: 'High',
    tagline: 'Vocal. Demanding. Intensely loyal.',
    temperament: 'The most communicative cat breed in existence. Siamese will tell you when they are hungry, bored, happy, or dissatisfied — loudly, at length, and without apology.',
    good_with: ['People who are home often', 'Those who appreciate vocal cats', 'Interactive, engaged owners'],
    not_for: ['Those wanting a quiet, independent cat', 'People away from home long hours', 'Light sleepers'],
    hook: 'If you want a quiet cat, a Siamese will educate you otherwise.',
    characteristics: [
      { label: 'Social Need', score: 95, note: 'Extremely social — does not do alone well' },
      { label: 'Energy Level', score: 85, note: 'Active and playful — needs daily engagement' },
      { label: 'Grooming Load', score: 20, note: 'Short coat — minimal grooming' },
      { label: 'Vocality', score: 98, note: 'Extremely vocal — will hold full conversations' },
    ],
    risk_flags: [
      { id: 'separation', title: 'Separation Distress', consequence: 'A Siamese left alone long-term will develop severe behavioural issues — destructive, vocal, and prone to stress-related illness. A second cat is often the solution.' },
      { id: 'dental', title: 'Dental Disease', consequence: 'Siamese have higher rates of dental issues than most breeds. Without regular brushing and vet cleaning, painful dental disease develops early.' },
      { id: 'respiratory', title: 'Respiratory Sensitivity', consequence: 'Siamese are more sensitive to respiratory infections than most breeds. Stress, cold, and dusty environments can trigger illness quickly.' },
    ],
    guardian_note: "A Siamese will narrate your life. It will follow you, comment on everything, and demand you account for your time. That is either exhausting or deeply entertaining — usually both. You will never feel alone in your home again.",
    lifespan: '12–15 years',
    weight: '3.5–5 kg',
  },
  {
    name: 'Persian',
    species: 'cat',
    energy_level: 'Low',
    tagline: 'Serene. Luxurious. High-maintenance.',
    temperament: 'The definition of a lap cat. Persians are calm, gentle, and perfectly suited to quiet indoor life — but their coat and facial structure require a level of daily care that most owners fail to anticipate.',
    good_with: ['Calm households', 'Seniors', 'Apartment dwellers', 'Those who enjoy grooming routines'],
    not_for: ['Active, chaotic households', 'Anyone who won\'t commit to daily grooming', 'Hot climates without AC'],
    hook: 'The most beautiful cat in the world — and the most demanding to maintain.',
    characteristics: [
      { label: 'Social Need', score: 55, note: 'Calm and content — less demanding than most breeds' },
      { label: 'Energy Level', score: 20, note: 'Minimal — prefers lounging to playing' },
      { label: 'Grooming Load', score: 98, note: 'Daily grooming non-negotiable — mats within 48 hours' },
      { label: 'Vocality', score: 25, note: 'Quiet and gentle — communicates with expression' },
    ],
    risk_flags: [
      { id: 'grooming', title: 'Grooming Neglect = Pain', consequence: 'A Persian\'s coat mats within 48 hours of missed brushing. Severe matting pulls at the skin constantly and requires sedated removal. This is a welfare issue, not a cosmetic one.' },
      { id: 'eyes', title: 'Chronic Eye Discharge', consequence: 'The flat face causes tear overflow that stains the face and, if uncleaned, causes skin infections. Daily face cleaning is as non-negotiable as brushing.' },
      { id: 'breathing', title: 'Breathing Difficulties', consequence: 'Brachycephalic anatomy means Persians struggle in heat and stress. They cannot self-regulate temperature efficiently — cool, calm environments are essential.' },
    ],
    guardian_note: "A Persian is a daily commitment disguised as a cat. The grooming alone will take 10–15 minutes every single day. Do it with love and you\'ll have the most serene, beautiful companion imaginable. Skip it and you\'ll have a suffering animal.",
    lifespan: '12–17 years',
    weight: '3–5 kg',
  },
  {
    name: 'Bengal',
    species: 'cat',
    energy_level: 'Very High',
    tagline: 'Wild. Athletic. Magnificently chaotic.',
    temperament: 'Part domestic cat, part Asian Leopard Cat by ancestry. Bengals are breathtakingly beautiful and genuinely wild in temperament. They will climb everything, destroy what they can\'t climb, and demand engagement relentlessly.',
    good_with: ['Active owners', 'Cat-experienced households', 'Those with outdoor enclosures (catios)', 'Adventure cat enthusiasts'],
    not_for: ['First-time cat owners', 'Quiet households', 'Anyone with precious breakables', 'Those who want a lap cat'],
    hook: 'A Bengal is the most beautiful cat you\'ll ever resent.',
    characteristics: [
      { label: 'Social Need', score: 75, note: 'Needs engagement but on their terms' },
      { label: 'Energy Level', score: 97, note: 'Insanely active — needs vertical space and daily play' },
      { label: 'Grooming Load', score: 25, note: 'Short coat — low maintenance' },
      { label: 'Vocality', score: 78, note: 'Vocal and demanding — chirps, chitters, and yowls' },
    ],
    risk_flags: [
      { id: 'destruction', title: 'Environmental Destruction', consequence: 'A Bengal without sufficient stimulation will dismantle your home systematically. Curtains, shelves, bins, and plants are the first casualties.' },
      { id: 'escape', title: 'Escape Drive', consequence: 'Bengals are resourceful and motivated. Standard window locks and basic enclosures will not hold them. An outdoor catio or leash training is strongly recommended.' },
      { id: 'hcm', title: 'Heart Disease (HCM)', consequence: 'Like many breeds, Bengals are susceptible to HCM. DNA-tested bloodlines reduce but don\'t eliminate the risk. Annual cardiac screening is recommended.' },
    ],
    guardian_note: "A Bengal will make your home feel alive — crackling with energy and unpredictability. It will also knock your wine glass off the counter while maintaining eye contact. If that sounds entertaining, you might be ready for one.",
    lifespan: '12–16 years',
    weight: '3.5–7 kg',
  },
  {
    name: 'Ragdoll',
    species: 'cat',
    energy_level: 'Low',
    tagline: 'Floppy. Devoted. Hearbreakingly gentle.',
    temperament: 'Named for their tendency to go limp when held, Ragdolls are the ultimate companion cat — calm, gentle, and deeply bonded to their families. They are the closest thing to a dog-cat that exists.',
    good_with: ['Families with children', 'Elderly owners', 'Multi-pet households', 'Indoor-only lifestyles'],
    not_for: ['Those wanting an independent cat', 'Busy households with little time for interaction', 'Outdoor-only setups'],
    hook: 'The cat that actually wants to be with you.',
    characteristics: [
      { label: 'Social Need', score: 90, note: 'Deeply bonded — follows owners room to room' },
      { label: 'Energy Level', score: 35, note: 'Calm and gentle — moderate play, happy to rest' },
      { label: 'Grooming Load', score: 65, note: 'Semi-long coat — twice-weekly brushing' },
      { label: 'Vocality', score: 35, note: 'Quiet and gentle — soft voices only' },
    ],
    risk_flags: [
      { id: 'hcm', title: 'Heart Disease (HCM)', consequence: 'HCM is prevalent in Ragdolls — there is a known genetic mutation in the breed. DNA testing of parents before purchasing reduces risk significantly.' },
      { id: 'naive', title: 'Dangerously Trusting', consequence: 'Ragdolls have no street sense. Their trust of strangers and other animals makes them profoundly unsuited to outdoor life. They will not protect themselves.' },
      { id: 'weight_entries', title: 'Obesity Risk', consequence: 'Their calm nature and love of food makes Ragdolls prone to weight gain. Portion control and daily gentle play are essential throughout their life.' },
    ],
    guardian_note: "A Ragdoll will meet you at the door, follow you to bed, and go completely limp in your arms. If you\'ve ever wanted a cat that actually wants to be with you — not just near you — this is the breed. Protect them. They won\'t protect themselves.",
    lifespan: '12–17 years',
    weight: '4.5–9 kg',
  },
  {
    name: 'British Shorthair',
    species: 'cat',
    energy_level: 'Low',
    tagline: 'Dignified. Independent. Plush-coated.',
    temperament: 'The British Shorthair is cat ownership at its most dignified. Calm, self-contained, and never needy — this breed is perfectly suited to those who love cats but respect that cats are not dogs.',
    good_with: ['Professionals with long work hours', 'First-time cat owners', 'Apartment dwellers', 'Multi-cat households'],
    not_for: ['Those expecting constant interaction', 'Anyone who wants to be followed everywhere'],
    hook: 'A cat with genuine self-respect — and it will expect yours in return.',
    characteristics: [
      { label: 'Social Need', score: 45, note: 'Independent but affectionate on their terms' },
      { label: 'Energy Level', score: 35, note: 'Calm and steady — short play bursts, long naps' },
      { label: 'Grooming Load', score: 40, note: 'Dense coat — weekly brushing, more during shedding' },
      { label: 'Vocality', score: 30, note: 'Quiet and composed — communicates subtly' },
    ],
    risk_flags: [
      { id: 'weight_entries', title: 'Obesity Prone', consequence: 'Their low activity and love of food make British Shorthairs one of the most obesity-prone cat breeds. Weight gain accelerates joint problems significantly.' },
      { id: 'hcm', title: 'Heart Disease (HCM)', consequence: 'A known health concern in the breed. Annual cardiac check-ups and health-tested breeding lines are the best protection.' },
      { id: 'handling', title: 'Doesn\'t Want to Be Held', consequence: 'British Shorthairs typically dislike being picked up. Forcing interaction leads to stress and relationship damage. They show love differently — respect that.' },
    ],
    guardian_note: "The British Shorthair will not follow you around or beg for attention. It will simply be there — solid, calm, and quietly devoted. If you can respect a cat\'s autonomy, this breed will reward you with genuine, understated loyalty.",
    lifespan: '14–20 years',
    weight: '4–8 kg',
  },
  {
    name: 'Abyssinian',
    species: 'cat',
    energy_level: 'Very High',
    tagline: 'Athletic. Curious. Perpetually moving.',
    temperament: 'One of the oldest and most active cat breeds. Abyssinians are in constant motion — investigating, climbing, and playing with an intensity that resembles a small, furry athlete.',
    good_with: ['Active households', 'Cat-experienced owners', 'Homes with vertical space', 'Those who enjoy interactive play'],
    not_for: ['Quiet, calm environments', 'Those wanting a lap cat', 'Small apartments without enrichment'],
    hook: 'An Abyssinian doesn\'t live in your house. It runs it.',
    characteristics: [
      { label: 'Social Need', score: 70, note: 'Social and engaged — but independent too' },
      { label: 'Energy Level', score: 95, note: 'Extremely active — needs cat trees, toys, and space' },
      { label: 'Grooming Load', score: 20, note: 'Short ticked coat — very low maintenance' },
      { label: 'Vocality', score: 55, note: 'Moderately vocal — chatty but not overwhelming' },
    ],
    risk_flags: [
      { id: 'pra', title: 'Progressive Retinal Atrophy', consequence: 'Abyssinians carry a genetic mutation causing progressive blindness. DNA testing of breeding cats can identify carriers — always ask breeders for test results.' },
      { id: 'renal', title: 'Renal Amyloidosis', consequence: 'A hereditary kidney disease that leads to kidney failure, often before age 5 in affected cats. Bloodline testing and early monitoring are critical.' },
      { id: 'boredom', title: 'Destructive When Bored', consequence: 'An under-stimulated Abyssinian dismantles its environment creatively and efficiently. Cat trees, puzzle feeders, and 20+ minutes of daily interactive play are essential.' },
    ],
    guardian_note: "An Abyssinian treats life like a sport and your home like a gymnasium. If that exhausts you to imagine, this isn\'t your breed. If it excites you, you\'re about to have one of the most entertaining animals of your life.",
    lifespan: '12–15 years',
    weight: '3–5 kg',
  },
  {
    name: 'Scottish Fold',
    species: 'cat',
    energy_level: 'Medium',
    tagline: 'Distinctive. Gentle. Ethically complex.',
    temperament: 'The owl-faced cat with a calm, sweet temperament. Scottish Folds are adaptable and affectionate — but the genetic mutation that gives them their iconic look also causes a painful, progressive joint disease in every single one of them.',
    good_with: ['Calm households', 'Families', 'Apartment dwellers', 'Those committed to vet monitoring'],
    not_for: ['Anyone unwilling to manage chronic health issues', 'Those who prioritise aesthetics over welfare'],
    hook: 'Before you fall for the ears — understand what they cost this cat.',
    characteristics: [
      { label: 'Social Need', score: 68, note: 'Gentle and social — enjoys family company' },
      { label: 'Energy Level', score: 50, note: 'Moderate — playful but calm' },
      { label: 'Grooming Load', score: 45, note: 'Short or long coat options — weekly brushing' },
      { label: 'Vocality', score: 40, note: 'Soft-voiced and gentle' },
    ],
    risk_flags: [
      { id: 'ocd', title: 'Osteochondrodysplasia — Always Present', consequence: 'The fold gene causes painful, degenerative joint disease in every Scottish Fold, to varying degrees. This is not a risk — it is a certainty. Pain management is a lifetime commitment.' },
      { id: 'pain', title: 'Silent Suffering', consequence: 'Cats hide pain exceptionally well. A Scottish Fold may be in chronic discomfort for months before showing visible signs. Regular vet assessments are the only way to monitor it.' },
      { id: 'ethics', title: 'Ethical Considerations', consequence: 'Many vets and animal welfare organisations advise against purchasing Scottish Folds due to the guaranteed health impact of the breeding. This is a decision to make with full information.' },
    ],
    guardian_note: "The Scottish Fold\'s look is undeniably charming. What\'s less charming is that those ears come with a genetic guarantee of joint pain. If you choose this breed, choose it with open eyes — and commit to managing their discomfort for life.",
    lifespan: '11–14 years',
    weight: '2.7–6 kg',
  },
  {
    name: 'Sphynx',
    species: 'cat',
    energy_level: 'High',
    tagline: 'Naked. Warm. Shockingly social.',
    temperament: 'No fur, no filter. The Sphynx is one of the most sociable, affectionate, and demanding cat breeds in existence. They crave human contact, generate extraordinary warmth, and will not tolerate being ignored.',
    good_with: ['People who are home frequently', 'Those who want a cat that behaves like a dog', 'Warm indoor environments'],
    not_for: ['Cold climates without heating', 'Those wanting an independent cat', 'Anyone with allergies to cat saliva (not dander)'],
    hook: 'No fur doesn\'t mean no maintenance. It means different maintenance.',
    characteristics: [
      { label: 'Social Need', score: 95, note: 'Extremely social — suffers without daily interaction' },
      { label: 'Energy Level', score: 80, note: 'Active and playful — strong climbers' },
      { label: 'Grooming Load', score: 70, note: 'Weekly skin bathing essential — skin oils accumulate' },
      { label: 'Vocality', score: 65, note: 'Vocal and expressive — communicates clearly' },
    ],
    risk_flags: [
      { id: 'skin', title: 'Weekly Bathing Required', consequence: 'Without fur to absorb skin oils, Sphynx cats become grimy quickly. Weekly baths are non-negotiable. Skipping them leads to skin infections and ear build-up.' },
      { id: 'cold', title: 'Cannot Self-Regulate Temperature', consequence: 'A Sphynx without warmth is a sick Sphynx. They require heated indoor environments, cat jumpers in winter, and should never be left in cold spaces.' },
      { id: 'hcm', title: 'Heart Disease (HCM)', consequence: 'HCM rates are among the highest in Sphynx cats. Annual echocardiograms from age 2 are the standard of care for responsible owners.' },
    ],
    guardian_note: "A Sphynx is a living hot water bottle that follows you everywhere and needs a bath once a week. If you want a cat that is relentlessly present, warm, and weird in the best possible way — you\'ve found your match.",
    lifespan: '12–15 years',
    weight: '3.5–7 kg',
  },
  {
    name: 'Norwegian Forest Cat',
    species: 'cat',
    energy_level: 'Medium',
    tagline: 'Rugged. Independent. Quietly magnificent.',
    temperament: 'Built for Scandinavian winters, the Norwegian Forest Cat is athletic, self-sufficient, and calm. Unlike many breeds, it doesn\'t demand constant attention — but it genuinely enjoys your company on its own terms.',
    good_with: ['Those who respect cat independence', 'Families with children', 'Multi-pet households', 'Owners with outdoor enclosures'],
    not_for: ['Those wanting a needy, clingy cat', 'Anyone who won\'t commit to grooming the coat'],
    hook: 'A cat built for the wild, content in your living room — on its terms.',
    characteristics: [
      { label: 'Social Need', score: 60, note: 'Independent but bonded — company without dependency' },
      { label: 'Energy Level', score: 62, note: 'Active phases and calm phases — balanced' },
      { label: 'Grooming Load', score: 72, note: 'Thick double coat — weekly brushing, heavy seasonal shed' },
      { label: 'Vocality', score: 35, note: 'Quiet and composed — communicates when needed' },
    ],
    risk_flags: [
      { id: 'hcm', title: 'Heart Disease (HCM)', consequence: 'HCM is a known concern in Norwegian Forest Cats. Annual screening from middle age and health-tested breeding lines provide the best protection.' },
      { id: 'gsd', title: 'Glycogen Storage Disease', consequence: 'A rare but serious metabolic condition found in this breed. DNA testing can identify carriers — ask breeders for certification.' },
      { id: 'coat', title: 'Seasonal Coat Overload', consequence: 'The double coat sheds heavily twice a year. During these periods, daily brushing is required to prevent matting and manage the volume of fur throughout the home.' },
    ],
    guardian_note: "The Norwegian Forest Cat has survived Scandinavian winters alone for centuries. It doesn\'t need you — but it chooses you. That distinction is what makes the relationship extraordinary.",
    lifespan: '14–16 years',
    weight: '3.5–8 kg',
  },
];

// ─── EXPORT ──────────────────────────────────────────────────────────────────

export const allBreeds: BreedProfile[] = [...dogBreeds, ...catBreeds];

export function getBreedData(breedName: string): BreedProfile | null {
  if (!breedName) return null;
  const normalized = breedName.trim().toLowerCase();
  return (
    allBreeds.find((b) => b.name.toLowerCase() === normalized) ?? null
  );
}

// Future-proof: swap this for an async API call without touching the rest of the app
export async function getBreedDataAsync(breedName: string): Promise<BreedProfile | null> {
  // TODO: replace with: const res = await fetch(`/api/breeds/${breedName}`);
  return getBreedData(breedName);
}