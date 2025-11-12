// Waste Classification Guide Database
const wasteGuide = {
  // Biodegradable Waste
  biodegradable: {
    category: 'Biodegradable',
    wasteType: 'Biodegradable',
    binColor: 'Green',
    items: [
      'Food waste', 'Vegetable peels', 'Fruit scraps', 'Tea bags',
      'Coffee grounds', 'Eggshells', 'Garden waste', 'Leaves',
      'Flowers', 'Paper (uncoated)', 'Cardboard', 'Wooden items'
    ],
    disposalInstructions: 'Dispose in GREEN bin. Can be composted to create nutrient-rich soil. Keep dry and avoid mixing with non-biodegradable waste.',
    tips: [
      'Compost at home if possible',
      'Remove any plastic packaging',
      'Keep separate from other waste',
      'Use for garden composting'
    ],
    decompositionTime: '2 weeks to 6 months'
  },

  // Recyclable - Plastic
  plastic: {
    category: 'Recyclable',
    wasteType: 'Recyclable - Plastic',
    binColor: 'Blue',
    items: [
      'Plastic bottles', 'Plastic containers', 'Plastic bags',
      'PET bottles', 'HDPE containers', 'Plastic packaging',
      'Plastic toys', 'Plastic furniture'
    ],
    disposalInstructions: 'Dispose in BLUE bin. Clean and dry before recycling. Remove caps and labels if possible. Flatten bottles to save space.',
    tips: [
      'Rinse containers before disposal',
      'Check for recycling symbol (1-7)',
      'Flatten to save space',
      'Avoid mixing with food waste'
    ],
    recyclingBenefit: '1 ton plastic recycled = 2 tons of CO2 emissions saved'
  },

  // Recyclable - Paper
  paper: {
    category: 'Recyclable',
    wasteType: 'Recyclable - Paper',
    binColor: 'Blue',
    items: [
      'Newspapers', 'Magazines', 'Office paper', 'Cardboard boxes',
      'Paper bags', 'Books', 'Notebooks', 'Cartons'
    ],
    disposalInstructions: 'Dispose in BLUE bin. Keep paper dry and clean. Remove any plastic coating, staples, or tape. Flatten boxes.',
    tips: [
      'Keep dry to prevent contamination',
      'Remove plastic windows from envelopes',
      'Flatten cardboard boxes',
      'Shred sensitive documents'
    ],
    recyclingBenefit: '1 ton paper recycled = 17 trees saved'
  },

  // Recyclable - Glass
  glass: {
    category: 'Recyclable',
    wasteType: 'Recyclable - Glass',
    binColor: 'Blue',
    items: [
      'Glass bottles', 'Glass jars', 'Glass containers',
      'Drinking glasses', 'Glass tableware'
    ],
    disposalInstructions: 'Dispose in BLUE bin. Rinse containers. Remove metal caps and lids. Be careful with broken glass - wrap in newspaper.',
    tips: [
      'Rinse before recycling',
      'Remove metal lids',
      'Separate by color if possible',
      'Wrap broken glass safely'
    ],
    recyclingBenefit: 'Glass can be recycled infinitely without quality loss'
  },

  // Recyclable - Metal
  metal: {
    category: 'Recyclable',
    wasteType: 'Recyclable - Metal',
    binColor: 'Blue',
    items: [
      'Aluminum cans', 'Steel cans', 'Tin containers',
      'Aluminum foil', 'Metal bottle caps', 'Wire hangers',
      'Metal utensils', 'Small metal items'
    ],
    disposalInstructions: 'Dispose in BLUE bin. Rinse cans and containers. Crush cans to save space. Remove any plastic labels.',
    tips: [
      'Rinse food cans',
      'Crush cans to save space',
      'Remove paper labels',
      'Separate ferrous and non-ferrous if possible'
    ],
    recyclingBenefit: 'Recycling 1 aluminum can saves enough energy to run a TV for 3 hours'
  },

  // E-waste
  ewaste: {
    category: 'E-waste',
    wasteType: 'E-waste',
    binColor: 'Yellow',
    items: [
      'Mobile phones', 'Computers', 'Laptops', 'Tablets',
      'Batteries', 'Chargers', 'LED bulbs', 'CFL bulbs',
      'Electronic toys', 'Circuit boards', 'Cables'
    ],
    disposalInstructions: 'Dispose in YELLOW bin or take to authorized e-waste collection center. DO NOT throw in regular waste. Contains harmful materials and valuable recoverable materials.',
    tips: [
      'Remove batteries before disposal',
      'Delete personal data from devices',
      'Take to certified e-waste recycler',
      'Check for buy-back programs'
    ],
    warning: '⚠️ Contains toxic materials like lead, mercury, and cadmium. Improper disposal harms environment.',
    recyclingBenefit: 'E-waste contains gold, silver, copper - valuable metals that can be recovered'
  },

  // Hazardous Waste
  hazardous: {
    category: 'Hazardous',
    wasteType: 'Hazardous',
    binColor: 'Red',
    items: [
      'Batteries', 'Paint', 'Pesticides', 'Chemicals',
      'Motor oil', 'Cleaning products', 'Medical waste',
      'Sharp objects', 'Expired medicines'
    ],
    disposalInstructions: 'Dispose in RED bin or take to hazardous waste collection facility. NEVER mix with regular waste. Handle with care.',
    tips: [
      'Store separately in sealed containers',
      'Take to hazardous waste facility',
      'Return medicines to pharmacy',
      'Never pour down drains'
    ],
    warning: '⚠️ DANGEROUS: Can cause serious harm to health and environment. Requires special handling.',
    specialInstructions: 'Contact local municipality for hazardous waste collection schedule'
  }
};

// Function to get waste info by type
const getWasteInfo = (wasteType) => {
  const normalizedType = wasteType.toLowerCase();
  
  if (normalizedType.includes('biodegradable') || normalizedType.includes('food') || normalizedType.includes('organic')) {
    return wasteGuide.biodegradable;
  }
  if (normalizedType.includes('plastic')) {
    return wasteGuide.plastic;
  }
  if (normalizedType.includes('paper') || normalizedType.includes('cardboard')) {
    return wasteGuide.paper;
  }
  if (normalizedType.includes('glass')) {
    return wasteGuide.glass;
  }
  if (normalizedType.includes('metal') || normalizedType.includes('aluminum') || normalizedType.includes('tin')) {
    return wasteGuide.metal;
  }
  if (normalizedType.includes('e-waste') || normalizedType.includes('electronic') || normalizedType.includes('battery')) {
    return wasteGuide.ewaste;
  }
  if (normalizedType.includes('hazardous') || normalizedType.includes('chemical') || normalizedType.includes('medical')) {
    return wasteGuide.hazardous;
  }
  
  // Default to biodegradable if unknown
  return wasteGuide.biodegradable;
};

// Function to search waste items
const searchWasteItem = (query) => {
  const results = [];
  const searchTerm = query.toLowerCase();
  
  Object.keys(wasteGuide).forEach(key => {
    const guide = wasteGuide[key];
    const matchingItems = guide.items.filter(item => 
      item.toLowerCase().includes(searchTerm)
    );
    
    if (matchingItems.length > 0) {
      results.push({
        ...guide,
        matchingItems
      });
    }
  });
  
  return results;
};

module.exports = {
  wasteGuide,
  getWasteInfo,
  searchWasteItem
};