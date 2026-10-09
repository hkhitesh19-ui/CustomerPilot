const fs = require('fs');
let code = fs.readFileSync('src/components/pricing/pricing-studio.tsx', 'utf8');

// Find the section starting at 'Compare all tenures' and get the 3 cards
const marker = '## Compare all tenures';
console.log('File has marker:', code.includes('Compare all tenures'));

// Let's identify the 3 cards in SECTION 2:
// Card 1: 6 Months (currently line 883)
// Card 2: 1 Year (currently line 960)
// Card 3: Lifetime Deal (currently line 1033)

const card6MoStart = code.indexOf('{/* Card 1: 6 Months */}');
const card1YrStart = code.indexOf('{/* Card 2: 1 Year (Recommended) */}');
const cardLifetimeStart = code.indexOf('{/* Card 3: Lifetime Deal */}');
const cardsEnd = code.indexOf('</section>', cardLifetimeStart);

console.log({ card6MoStart, card1YrStart, cardLifetimeStart, cardsEnd });

if (card6MoStart !== -1 && card1YrStart !== -1 && cardLifetimeStart !== -1 && cardsEnd !== -1) {
  const card6Mo = code.slice(card6MoStart, card1YrStart);
  const card1Yr = code.slice(card1YrStart, cardLifetimeStart);
  const cardLifetime = code.slice(cardLifetimeStart, code.indexOf('</div>\n      </section>', cardLifetimeStart));

  // Ascending order: Lifetime (₹1,499) -> 6 Months (₹1,749) -> 1 Year Pro (₹2,249)
  const newOrder = cardLifetime + card6Mo + card1Yr;
  const oldOrder = code.slice(card6MoStart, code.indexOf('</div>\n      </section>', cardLifetimeStart));

  code = code.replace(oldOrder, newOrder);
  fs.writeFileSync('src/components/pricing/pricing-studio.tsx', code, 'utf8');
  console.log('Successfully reordered Section 2 tenures to ascending order (Lifetime ₹1,499 -> 6 Months ₹1,749 -> 1 Year Pro ₹2,249)!');
} else {
  console.error('Failed to locate cards');
  process.exit(1);
}
