'use client';

import { useState } from 'react';

type FoodItem = {
  name: string;
  safe: 'yes' | 'no' | 'caution';
  dog: string;
  cat: string;
  details: string;
};

const foodDatabase: FoodItem[] = [
  // ===== PROTEINS =====
  { name: 'Chicken', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Cooked, boneless chicken is an excellent lean protein. Remove all skin and bones. Never feed raw chicken due to salmonella risk. Great for sensitive stomachs.' },
  { name: 'Beef', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Lean beef is a good protein source. Cook thoroughly without seasoning. Trim excess fat to avoid pancreatitis. Ground beef should be drained of grease.' },
  { name: 'Lamb', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Cooked lamb is safe and nutritious. Remove bones and excess fat. Good alternative protein for pets with chicken allergies.' },
  { name: 'Pork', safe: 'caution', dog: '⚠️ Caution', cat: '⚠️ Caution', details: 'Cooked plain pork is okay in small amounts. NEVER feed raw pork (risk of parasites). Avoid processed pork like bacon, ham, or sausage due to high salt content.' },
  { name: 'Fish', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Cooked fish (salmon, sardines, hake) is excellent. Rich in Omega-3 for healthy coat. ALWAYS remove bones. Never feed raw fish. Cats especially love fish!' },
  { name: 'Salmon', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Cooked salmon is one of the best foods for pets. High in Omega-3 fatty acids for skin and coat health. Never feed raw salmon to dogs (salmon poisoning disease).' },
  { name: 'Sardines', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Tinned sardines in water (not oil or tomato sauce) are excellent. Great source of Omega-3. Feed 1-2 sardines for small dogs, 3-4 for large dogs. Remove if in salt water.' },
  { name: 'Tuna', safe: 'caution', dog: '⚠️ Occasionally', cat: '⚠️ Occasionally', details: 'Small amounts of cooked tuna are okay. Do NOT feed regularly — tuna contains mercury which builds up over time. Cats can become addicted and refuse other food.' },
  { name: 'Hake', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Cooked hake is a great South African fish option. Low in mercury, high in protein. Steam or boil without seasoning. Remove all bones.' },
  { name: 'Eggs', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Cooked eggs (scrambled or boiled) are great protein. Rich in amino acids and vitamins. Do NOT add salt, butter, or oil. Raw eggs carry salmonella risk.' },
  { name: 'Liver', safe: 'caution', dog: '⚠️ Small amounts', cat: '⚠️ Small amounts', details: 'Chicken liver is nutritious but very rich. Too much causes Vitamin A toxicity. Feed no more than 5% of total diet. Cook thoroughly without seasoning.' },
  { name: 'Mince', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Lean cooked mince is fine. Drain all grease after cooking. Do not add onions, garlic, or seasoning. Avoid fatty mince.' },
  { name: 'Turkey', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Plain cooked turkey (no skin or bones) is safe and lean. Good protein source. Avoid deli turkey slices — too much salt and preservatives.' },
  { name: 'Venison', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Cooked venison (game meat like kudu, springbok) is excellent lean protein. Great for pets with common protein allergies. Cook thoroughly.' },
  { name: 'Ostrich', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Ostrich meat is lean and hypoallergenic. Popular in South African pet foods. Great alternative protein for sensitive pets.' },

  // ===== FRUITS =====
  { name: 'Apple', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Sliced apples (WITHOUT seeds or core) are a healthy treat. Apple seeds contain cyanide — always remove them. Good source of fiber and vitamins A & C.' },
  { name: 'Banana', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Bananas are safe in moderation. High in potassium and fiber. Too much can cause constipation. Give small pieces as treats, not a full banana.' },
  { name: 'Blueberries', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Blueberries are a superfood for pets! Rich in antioxidants. Great training treat due to small size. Feed fresh or frozen.' },
  { name: 'Watermelon', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Seedless watermelon flesh is safe and hydrating. Remove ALL seeds and rind. Great summer treat. High in vitamins A, B6, and C.' },
  { name: 'Strawberries', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Fresh strawberries are safe in moderation. High in vitamin C and fiber. Cut into small pieces to prevent choking. Remove the leaves.' },
  { name: 'Mango', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Mango flesh is safe. Remove the skin and large pit (pit contains cyanide). High in vitamins. Feed in small amounts due to sugar content.' },
  { name: 'Orange', safe: 'caution', dog: '⚠️ Small amounts', cat: '❌ Avoid', details: 'Dogs can have small amounts of orange flesh (no peel or seeds). Cats should avoid citrus — it upsets their stomach. The citric acid and oils can be irritating.' },
  { name: 'Grapes', safe: 'no', dog: '❌ TOXIC', cat: '❌ TOXIC', details: '🚨 EXTREMELY DANGEROUS! Even a single grape can cause sudden kidney failure in dogs. Symptoms: vomiting, lethargy, loss of appetite. Seek EMERGENCY vet care immediately if eaten.' },
  { name: 'Raisins', safe: 'no', dog: '❌ TOXIC', cat: '❌ TOXIC', details: '🚨 EXTREMELY DANGEROUS! Even MORE toxic than grapes because they are concentrated. A small handful can be fatal. Rush to the vet immediately if ingested.' },
  { name: 'Avocado', safe: 'no', dog: '❌ Avoid', cat: '❌ Avoid', details: 'Avocado contains persin, which is toxic to dogs and cats. The pit is also a choking hazard. Avoid all parts of the avocado including the flesh, skin, and pit.' },
  { name: 'Lemon', safe: 'no', dog: '❌ Avoid', cat: '❌ Avoid', details: 'Citric acid and essential oils in lemons cause vomiting, diarrhea, and depression. Most pets naturally avoid the smell, but keep lemons out of reach.' },
  { name: 'Peach', safe: 'caution', dog: '⚠️ Flesh only', cat: '⚠️ Flesh only', details: 'Peach flesh is okay in small amounts. The PIT is dangerous — contains cyanide and is a choking/blockage hazard. Always remove the stone completely.' },
  { name: 'Pineapple', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Fresh pineapple chunks (no skin or core) are safe. Contains bromelain which helps digestion. Feed in moderation due to sugar. Avoid canned pineapple (too much sugar).' },
  { name: 'Pear', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Pear flesh is safe and nutritious. Remove seeds (contain cyanide traces) and core. Cut into small pieces. Good source of vitamins C and K.' },

  // ===== VEGETABLES =====
  { name: 'Carrots', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Carrots are one of the best treats! Raw carrots clean teeth, cooked carrots are easier to digest. Low calorie, high in beta-carotene and fiber.' },
  { name: 'Sweet Potato', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Cooked sweet potato (no skin) is very nutritious. Rich in fiber, vitamins A and C. Great for digestion. Never feed raw sweet potato.' },
  { name: 'Pumpkin', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Cooked plain pumpkin is excellent for digestion. Helps with both diarrhea and constipation. Rich in fiber and beta-carotene. Avoid pumpkin pie mix (has spices).' },
  { name: 'Butternut', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Cooked butternut squash is safe and nutritious. Popular in South African cooking. Remove skin and seeds before feeding. Good source of vitamins.' },
  { name: 'Green Beans', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Plain green beans (raw, steamed, or canned without salt) are excellent. Low calorie, high in fiber. Great for overweight pets as a meal filler.' },
  { name: 'Broccoli', safe: 'caution', dog: '⚠️ Small amounts', cat: '⚠️ Small amounts', details: 'Small amounts of cooked broccoli are okay. Too much causes gas and stomach upset. The florets contain isothiocyanates which can irritate the stomach.' },
  { name: 'Spinach', safe: 'caution', dog: '⚠️ Small amounts', cat: '⚠️ Small amounts', details: 'Small amounts are fine and nutritious. Contains oxalates which can affect kidneys if fed in large quantities over time. Avoid for pets with kidney issues.' },
  { name: 'Peas', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Green peas (fresh, frozen, or thawed) are safe and nutritious. Good source of protein and vitamins. Avoid canned peas due to added sodium.' },
  { name: 'Cucumber', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Cucumbers are perfectly safe and very hydrating. Low in calories, great for overweight pets. Cut into small pieces to prevent choking.' },
  { name: 'Tomato', safe: 'caution', dog: '⚠️ Ripe only', cat: '⚠️ Ripe only', details: 'Ripe red tomato flesh is okay in small amounts. GREEN tomatoes, stems, and leaves are TOXIC (contain solanine). Avoid tomato sauce (has garlic/onion).' },
  { name: 'Onions', safe: 'no', dog: '❌ TOXIC', cat: '❌ TOXIC', details: '🚨 VERY DANGEROUS! All forms (raw, cooked, powder, dehydrated) damage red blood cells causing anemia. Even small amounts in gravy or soup are harmful. Cats are even more sensitive than dogs.' },
  { name: 'Garlic', safe: 'no', dog: '❌ TOXIC', cat: '❌ TOXIC', details: '🚨 VERY DANGEROUS! 5x more toxic than onions. Damages red blood cells. Symptoms may take days to appear: weakness, pale gums, rapid breathing. All forms are toxic including garlic bread.' },
  { name: 'Mushrooms', safe: 'no', dog: '❌ Avoid', cat: '❌ Avoid', details: 'Store-bought mushrooms are technically safe, but wild mushrooms can be FATAL. Since pets cannot tell the difference, it is safest to avoid all mushrooms. Some wild SA mushrooms are extremely toxic.' },
  { name: 'Corn', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Corn kernels (off the cob) are safe. NEVER give the corn cob — it causes deadly intestinal blockage. Plain mielies/sweetcorn without butter or salt is fine.' },
  { name: 'Mielies', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Same as corn — mielie kernels are safe but NEVER the cob. The cob does not digest and can block the intestines, requiring emergency surgery.' },
  { name: 'Potato', safe: 'caution', dog: '⚠️ Cooked only', cat: '⚠️ Cooked only', details: 'Plain cooked potato is okay in moderation. RAW potato and green potato contain solanine (toxic). Never feed potato skin. Avoid chips, fries, or seasoned potatoes.' },
  { name: 'Lettuce', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Lettuce is safe but has very little nutritional value. Good as a low-calorie treat. Wash thoroughly. Some cats may not be interested.' },
  { name: 'Cabbage', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Cooked cabbage is safe in small amounts. Raw cabbage can cause gas. Do not feed too much — it contains thiocyanate which can affect thyroid function.' },

  // ===== GRAINS & STARCHES =====
  { name: 'Rice', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Plain cooked white rice is one of the best foods for upset stomachs. Easy to digest. Brown rice is okay too but harder to digest. No seasoning or butter.' },
  { name: 'Pap', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Plain pap (maize meal porridge) without salt, butter, or milk is safe in small amounts. Common in South African pet feeding. Not very nutritious on its own — add protein.' },
  { name: 'Maize Meal', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Same as pap — plain cooked maize meal is safe. Avoid adding salt, sugar, or milk. Should not replace proper pet food as it lacks essential nutrients.' },
  { name: 'Bread', safe: 'caution', dog: '⚠️ Small amounts', cat: '⚠️ Small amounts', details: 'Small amounts of plain bread are okay but not nutritious. NEVER feed raw dough — it expands in the stomach and produces alcohol. Avoid raisin bread (toxic!).' },
  { name: 'Pasta', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Plain cooked pasta (no sauce) is safe in moderation. Not very nutritious — mostly carbs. Avoid pasta with garlic, onion, or tomato sauce.' },
  { name: 'Oats', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Plain cooked oatmeal is safe and good for digestion. Good source of fiber. Do not add sugar, milk, or flavoring. Great for dogs with wheat allergies.' },
  { name: 'Samp', safe: 'yes', dog: '✅ Safe', cat: '⚠️ Small amounts', details: 'Plain cooked samp without salt or butter is okay for dogs. Traditional South African food. Not ideal as regular pet food — low in protein. Cats generally do not need grains.' },

  // ===== DAIRY =====
  { name: 'Cheese', safe: 'caution', dog: '⚠️ Small amounts', cat: '⚠️ Small amounts', details: 'Small pieces of plain cheese are okay as treats. Many pets are lactose intolerant. Low-fat cheeses like mozzarella are better. Avoid blue cheese (toxic mold).' },
  { name: 'Yogurt', safe: 'yes', dog: '✅ Safe', cat: '⚠️ Small amounts', details: 'Plain, unsweetened yogurt with live cultures is beneficial for digestion. Avoid flavored yogurt (too much sugar). NEVER feed yogurt with xylitol (artificial sweetener — toxic!).' },
  { name: 'Milk', safe: 'caution', dog: '⚠️ Most pets are intolerant', cat: '⚠️ Most cats are intolerant', details: 'Most adult dogs and cats are lactose intolerant. Milk causes diarrhea, gas, and stomach pain. If you want to give milk, use special pet milk from the vet or pet shop.' },
  { name: 'Ice Cream', safe: 'no', dog: '❌ Avoid', cat: '❌ Avoid', details: 'Ice cream contains too much sugar and dairy. Can cause diarrhea and obesity. Some contain xylitol (extremely toxic) or chocolate (toxic). Buy special pet ice cream instead.' },
  { name: 'Butter', safe: 'no', dog: '❌ Avoid', cat: '❌ Avoid', details: 'Butter is too high in fat. Can cause pancreatitis (inflamed pancreas) which is painful and dangerous. Even small amounts of butter on food should be avoided.' },

  // ===== SOUTH AFRICAN SPECIFIC =====
  { name: 'Biltong', safe: 'no', dog: '❌ Avoid', cat: '❌ Avoid', details: 'Biltong is too salty and contains spices (coriander, pepper, vinegar) that irritate pet stomachs. The high salt content can cause sodium poisoning. Buy proper pet biltong treats instead.' },
  { name: 'Droewors', safe: 'no', dog: '❌ Avoid', cat: '❌ Avoid', details: 'Same problems as biltong — too salty and spicy for pets. The casing can also be a choking hazard. Rather buy pet-safe dried meat treats from the pet shop.' },
  { name: 'Boerewors', safe: 'no', dog: '❌ Avoid', cat: '❌ Avoid', details: 'Boerewors contains too much fat, salt, and spices (coriander, cloves, nutmeg). Often contains onion or garlic which are toxic. Never feed braai meat with seasoning.' },
  { name: 'Vetkoek', safe: 'no', dog: '❌ Avoid', cat: '❌ Avoid', details: 'Vetkoek is deep-fried dough — too much oil and fat. Can cause pancreatitis. Raw dough is even worse — it expands in the stomach and ferments into alcohol.' },
  { name: 'Koeksisters', safe: 'no', dog: '❌ Avoid', cat: '❌ Avoid', details: 'Way too much sugar and oil. Can cause obesity, diabetes, and pancreatitis in pets. The sticky syrup can also cause dental problems.' },
  { name: 'Rusks', safe: 'caution', dog: '⚠️ Plain only', cat: '❌ Avoid', details: 'A small piece of plain rusk occasionally is okay for dogs. Avoid rusks with raisins (toxic!), chocolate, or lots of sugar. Not suitable for cats.' },
  { name: 'Braai Meat', safe: 'caution', dog: '⚠️ Plain only', cat: '⚠️ Plain only', details: 'Plain grilled meat without seasoning, marinade, or sauce is okay. Remove all bones (cooked bones splinter!). Avoid charred/burnt pieces. No sosatie sauce or monkey gland!' },
  { name: 'Chakalaka', safe: 'no', dog: '❌ Avoid', cat: '❌ Avoid', details: 'Contains onions, garlic, and chili — all harmful to pets. The spice mix irritates the digestive system. Keep all spicy relishes away from pets.' },
  { name: 'Bunny Chow', safe: 'no', dog: '❌ Avoid', cat: '❌ Avoid', details: 'The curry contains onions, garlic, and strong spices — all dangerous for pets. The bread portion is also not ideal. Keep this Durban favourite for humans only!' },
  { name: 'Bobotie', safe: 'no', dog: '❌ Avoid', cat: '❌ Avoid', details: 'Contains onions, garlic, curry spices, and raisins — multiple toxic ingredients for pets. The egg topping with milk can also cause stomach upset.' },
  { name: 'Gatsby', safe: 'no', dog: '❌ Avoid', cat: '❌ Avoid', details: 'This Cape Town classic contains chips, sauce, and seasoned meat — too much salt, fat, and spices for pets. The bread is also not nutritious for animals.' },
  { name: 'Melktert', safe: 'no', dog: '❌ Avoid', cat: '❌ Avoid', details: 'Contains sugar, milk, and cinnamon. Too much dairy and sugar for pets. While cinnamon is not toxic, the sugar and pastry make this unsuitable for animals.' },

  // ===== DANGEROUS SUBSTANCES =====
  { name: 'Chocolate', safe: 'no', dog: '❌ TOXIC', cat: '❌ TOXIC', details: '🚨 VERY DANGEROUS! Contains theobromine which pets cannot metabolize. Dark chocolate is worst. Symptoms: vomiting, rapid breathing, seizures, heart failure. EMERGENCY: contact vet immediately.' },
  { name: 'Coffee', safe: 'no', dog: '❌ TOXIC', cat: '❌ TOXIC', details: '🚨 DANGEROUS! Caffeine causes rapid heartbeat, tremors, seizures, and can be fatal. This includes coffee grounds, tea, energy drinks, and caffeine pills.' },
  { name: 'Tea', safe: 'no', dog: '❌ Avoid', cat: '❌ Avoid', details: 'Tea contains caffeine which is toxic to pets. Even rooibos tea (while less dangerous) should not be given to pets. Keep all tea and tea bags out of reach.' },
  { name: 'Rooibos', safe: 'caution', dog: '⚠️ Not recommended', cat: '⚠️ Not recommended', details: 'Rooibos is caffeine-free and less dangerous than regular tea, but it is not meant for pets. Some holistic vets use it for skin rinsing, but do not give it as a drink.' },
  { name: 'Alcohol', safe: 'no', dog: '❌ TOXIC', cat: '❌ TOXIC', details: '🚨 EXTREMELY DANGEROUS! Even small amounts cause vomiting, diarrhea, difficulty breathing, coma, and death. This includes beer, wine, spirits, and fermented foods.' },
  { name: 'Xylitol', safe: 'no', dog: '❌ EXTREMELY TOXIC', cat: '❌ TOXIC', details: '🚨 MOST DANGEROUS ITEM ON THIS LIST! Found in sugar-free gum, sweets, toothpaste, and some peanut butters. Causes rapid insulin release → seizures → liver failure → death. EMERGENCY!' },
  { name: 'Macadamia Nuts', safe: 'no', dog: '❌ TOXIC', cat: '❌ TOXIC', details: '🚨 DANGEROUS! Causes weakness, vomiting, tremors, and hyperthermia. Symptoms appear within 12 hours. Combined with chocolate (like in cookies), the danger doubles.' },
  { name: 'Walnuts', safe: 'no', dog: '❌ Avoid', cat: '❌ Avoid', details: 'Can cause stomach upset and intestinal blockage. Moldy walnuts produce toxins that cause seizures. All nuts are choking hazards for pets.' },
  { name: 'Almonds', safe: 'caution', dog: '⚠️ Not recommended', cat: '❌ Avoid', details: 'Not toxic but difficult to digest. Choking hazard, especially for small dogs. Salted or flavored almonds are worse. Generally best to avoid all nuts.' },
  { name: 'Peanut Butter', safe: 'caution', dog: '⚠️ Check label!', cat: '⚠️ Check label!', details: 'Plain peanut butter WITHOUT xylitol is a great treat for dogs. ALWAYS check the ingredients — some brands contain xylitol (extremely toxic!). Look for: peanuts only, no sweeteners.' },
  { name: 'Bones', safe: 'no', dog: '❌ Cooked = dangerous', cat: '❌ Avoid', details: '🚨 COOKED bones splinter and can puncture intestines or cause choking. RAW bones are safer but still risky. Always supervise. Never give chicken, pork, or fish bones.' },
  { name: 'Cooked Bones', safe: 'no', dog: '❌ DANGEROUS', cat: '❌ DANGEROUS', details: '🚨 Cooked bones become brittle and splinter into sharp pieces. These can pierce the throat, stomach, or intestines — requiring emergency surgery. This includes braai bones!' },
  { name: 'Raw Bones', safe: 'caution', dog: '⚠️ Supervised only', cat: '⚠️ Supervised only', details: 'Raw meaty bones (like raw chicken necks for small dogs) can be okay under supervision. Always match bone size to pet size. Never leave pets alone with bones. Discard after 1-2 hours.' },
  
  // ===== TREATS & MISC =====
  { name: 'Honey', safe: 'caution', dog: '⚠️ Small amounts', cat: '❌ Avoid', details: 'A tiny amount of honey is okay for adult dogs. Do NOT give to puppies (botulism risk). High in sugar — use sparingly. Cats do not taste sweetness so there is no benefit.' },
  { name: 'Coconut', safe: 'yes', dog: '✅ Safe', cat: '✅ Small amounts', details: 'Coconut flesh and coconut oil are safe. Good for skin and coat health. Start with small amounts to avoid loose stools. Coconut water is okay but not coconut milk (too fatty).' },
  { name: 'Popcorn', safe: 'caution', dog: '⚠️ Plain only', cat: '❌ Not recommended', details: 'Plain air-popped popcorn (no salt, butter, or flavoring) is okay as an occasional treat. Un-popped kernels are a choking hazard. Avoid microwave popcorn completely.' },
  { name: 'Sugar', safe: 'no', dog: '❌ Avoid', cat: '❌ Avoid', details: 'Sugar causes obesity, dental problems, and diabetes in pets. Avoid all sugary foods, sweets, and desserts. Pets do not need sugar in their diet at all.' },
  { name: 'Salt', safe: 'no', dog: '❌ Avoid', cat: '❌ Avoid', details: 'Too much salt causes sodium poisoning: vomiting, diarrhea, tremors, seizures. Avoid salty snacks, chips, pretzels, and adding salt to pet food. Fresh water must always be available.' },
  { name: 'Chips', safe: 'no', dog: '❌ Avoid', cat: '❌ Avoid', details: 'Potato chips / crisps are too salty and fatty for pets. The seasoning (especially onion and garlic flavored chips) can be toxic. This includes Simba, Lays, and all brands.' },
  { name: 'Sweets', safe: 'no', dog: '❌ DANGEROUS', cat: '❌ DANGEROUS', details: 'Sweets and candy often contain xylitol (extremely toxic), chocolate (toxic), or excessive sugar. Hard sweets are choking hazards. Keep all sweets out of reach.' },
  { name: 'Dog Biscuits', safe: 'yes', dog: '✅ Safe', cat: '⚠️ Not ideal', details: 'Commercial dog biscuits are formulated for dogs and are safe. Follow package guidelines for portion sizes. Do not feed dog treats to cats — they have different nutritional needs.' },
  { name: 'Cat Food', safe: 'caution', dog: '⚠️ Not for dogs', cat: '✅ Safe for cats', details: 'Cat food is too high in protein and fat for dogs. Occasional nibble will not harm a dog, but regular feeding causes obesity and pancreatitis. Each pet needs their own food.' },
  { name: 'Dog Food', safe: 'caution', dog: '✅ Safe for dogs', cat: '⚠️ Not for cats', details: 'Dog food lacks taurine and other nutrients cats need. A cat eating dog food regularly will develop heart disease and vision problems. Always feed species-appropriate food.' },
  
  // ===== SA PET FOOD BRANDS =====
  { name: 'Montego', safe: 'yes', dog: '✅ Good brand', cat: '✅ Good brand', details: 'Montego is a quality South African pet food brand. Their Karoo range is well-regarded. Available at most supermarkets and pet shops. Good mid-range option.' },
  { name: 'Bobtail', safe: 'yes', dog: '✅ Budget option', cat: 'N/A', details: 'Bobtail is an affordable South African dog food. Suitable for basic nutrition on a budget. For better nutrition, consider mixing with cooked vegetables or upgrading to Montego/Acana.' },
  { name: 'Husky', safe: 'yes', dog: '✅ Budget option', cat: 'N/A', details: 'Husky is another affordable SA dog food option. Basic nutrition coverage. Good for feeding large dogs on a budget. Consider supplementing with cooked vegetables and lean meat.' },
  { name: 'Jock', safe: 'yes', dog: '✅ Good brand', cat: 'N/A', details: 'Jock is a well-known South African dog food brand. Good quality ingredients. Multiple ranges available for different life stages and sizes. Available at most retailers.' },
  { name: 'Canine Cuisine', safe: 'yes', dog: '✅ Good brand', cat: 'N/A', details: 'Popular mid-range South African dog food. Good variety of flavors and life-stage options. Widely available at Pick n Pay, Checkers, and pet shops.' },
];

export default function PetSafeFoodChecker() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'dog' | 'cat' | 'both'>('both');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (term?: string) => {
    const query = (term || searchTerm).toLowerCase().trim();
    if (!query) return;
    
    const filtered = foodDatabase.filter(food =>
      food.name.toLowerCase().includes(query)
    );
    setResults(filtered);
    setHasSearched(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const getStatusColor = (safe: string) => {
    if (safe === 'yes') return 'bg-green-50 border-green-300';
    if (safe === 'no') return 'bg-red-50 border-red-300';
    return 'bg-yellow-50 border-yellow-300';
  };

  const getStatusText = (safe: string) => {
    if (safe === 'yes') return 'text-green-700';
    if (safe === 'no') return 'text-red-700';
    return 'text-yellow-700';
  };

  const getStatusBadge = (safe: string) => {
    if (safe === 'yes') return '✅ SAFE';
    if (safe === 'no') return '❌ DANGEROUS';
    return '⚠️ CAUTION';
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">🍖 Pet Food Safety Checker</h1>
        <p className="text-gray-600">
          Can your pet eat that? Search any food to find out instantly!
        </p>
        <p className="text-sm text-gray-400 mt-1">
          🇿🇦 Includes South African foods &amp; brands
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type any food (e.g. biltong, chocolate, rice...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 p-4 border-2 border-orange-300 rounded-lg text-black focus:border-orange-500 focus:outline-none"
          />
          <button
            onClick={() => handleSearch()}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 rounded-lg transition"
          >
            🔍
          </button>
        </div>

        {/* Pet Type */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setSelectedType('dog')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
              selectedType === 'dog' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🐕 Dog
          </button>
          <button
            onClick={() => setSelectedType('cat')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
              selectedType === 'cat' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🐈 Cat
          </button>
          <button
            onClick={() => setSelectedType('both')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
              selectedType === 'both' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🐾 Both
          </button>
        </div>
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="space-y-4 mb-8">
          {results.length === 0 ? (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
              <p className="text-xl mb-2">🤔 Not found</p>
              <p className="text-gray-600">
                We don&apos;t have information for &quot;{searchTerm}&quot; yet.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                When in doubt, always consult your vet before feeding your pet something new!
              </p>
            </div>
          ) : (
            results.map((food, index) => (
              <div
                key={index}
                className={`p-5 rounded-xl border-2 shadow-sm ${getStatusColor(food.safe)}`}
              >
                {/* Food Name + Badge */}
                <div className="flex justify-between items-center mb-2">
                  <h3 className={`font-bold text-xl ${getStatusText(food.safe)}`}>
                    {food.name}
                  </h3>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                    food.safe === 'yes' ? 'bg-green-200 text-green-800' :
                    food.safe === 'no' ? 'bg-red-200 text-red-800' :
                    'bg-yellow-200 text-yellow-800'
                  }`}>
                    {getStatusBadge(food.safe)}
                  </span>
                </div>

                {/* Dog / Cat Status */}
                <div className="flex gap-4 mb-3 text-sm">
                  {(selectedType === 'dog' || selectedType === 'both') && (
                    <span>🐕 {food.dog}</span>
                  )}
                  {(selectedType === 'cat' || selectedType === 'both') && (
                    <span>🐈 {food.cat}</span>
                  )}
                </div>

                {/* Detailed Info */}
                <p className="text-gray-700 text-sm leading-relaxed">{food.details}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Quick Search Buttons */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🔥 Most Searched:</h3>
        <div className="flex flex-wrap gap-2">
          {['Chocolate', 'Grapes', 'Chicken', 'Rice', 'Bones', 'Peanut Butter', 'Banana', 'Avocado', 'Biltong', 'Boerewors', 'Pap', 'Eggs'].map(food => (
            <button
              key={food}
              onClick={() => {
                setSearchTerm(food);
                handleSearch(food);
              }}
              className="px-3 py-2 bg-gray-100 hover:bg-orange-100 rounded-lg text-sm transition"
            >
              {food}
            </button>
          ))}
        </div>
      </div>

      {/* SA Foods Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🇿🇦 South African Foods:</h3>
        <div className="flex flex-wrap gap-2">
          {['Biltong', 'Droewors', 'Boerewors', 'Pap', 'Vetkoek', 'Chakalaka', 'Bunny Chow', 'Bobotie', 'Braai Meat', 'Rusks', 'Mielies', 'Samp', 'Gatsby', 'Koeksisters', 'Melktert', 'Rooibos'].map(food => (
            <button
              key={food}
              onClick={() => {
                setSearchTerm(food);
                handleSearch(food);
              }}
              className="px-3 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-sm transition"
            >
              {food}
            </button>
          ))}
        </div>
      </div>

      {/* SA Brands Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🛒 SA Pet Food Brands:</h3>
        <div className="flex flex-wrap gap-2">
          {['Montego', 'Bobtail', 'Husky', 'Jock', 'Canine Cuisine'].map(food => (
            <button
              key={food}
              onClick={() => {
                setSearchTerm(food);
                handleSearch(food);
              }}
              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-sm transition"
            >
              {food}
            </button>
          ))}
        </div>
      </div>

      {/* Emergency Banner */}
      <div className="bg-red-600 text-white rounded-xl p-6 text-center">
        <h3 className="font-bold text-lg mb-2">🚨 Pet Ate Something Toxic?</h3>
        <p className="mb-3">Contact your vet IMMEDIATELY or call the emergency line</p>
        <p className="text-2xl font-bold">📞 Your Vet&apos;s Number</p>
        <p className="text-sm mt-2 opacity-80">Time is critical — do not wait for symptoms to appear</p>
      </div>
    </div>
  );
}