// Editable preference and spending scenarios, not income predictions by age. Weights total 100.
export const PRESETS = [
  {
    id: 'single', name: 'Single / bachelors', subtitle: 'Budget, parks & connections',
    description: 'Affordable living, places to go out, green spaces and public transport.',
    note: 'Uses mapped cafés and cinemas for going out. It does not measure nightlife quality, prices or opening hours.',
    costSettings: { bhk: 1, monthlyBudget: 30000, nonRent: 10000 },
    weights: { cost_of_living: 40, mall_count: 10, park: 10, cinema_count: 10, cafe_count: 10, metro: 15, bus_stop: 5 }
  },
  {
    id: 'couples', name: 'Young married couples', subtitle: 'Healthcare & shared leisure',
    description: 'Nearby healthcare, parks, shopping and places to spend time together.',
    note: 'Cafés are a leisure proxy; fine-dining quality and restaurant coverage are not scored yet.',
    costSettings: { bhk: 2, monthlyBudget: 55000, nonRent: 20000 },
    weights: { cost_of_living: 25, hospital: 20, park: 10, mall_count: 15, cafe_count: 10, noise: 10, metro: 10 }
  },
  {
    id: 'parents', name: 'Young parents', subtitle: 'Schools, healthcare & parks',
    description: 'Mapped schools, nearby healthcare, parks and quieter surroundings.',
    note: 'School counts do not establish teaching quality, admissions, fees or suitability. Noise is an uncalibrated road proxy.',
    costSettings: { bhk: 2, monthlyBudget: 75000, nonRent: 30000 },
    weights: { cost_of_living: 20, school_count: 30, hospital: 20, park: 15, noise: 10, bus_stop: 5 }
  },
  {
    id: 'retired', name: 'Retired / local living', subtitle: 'Quiet & essentials close by',
    description: 'Quieter surroundings and healthcare, pharmacies, parks and transit near home.',
    note: 'Within-ward service presence is a proxy for self-contained living. Accessible footpaths and walkability are not measured.',
    costSettings: { bhk: 2, monthlyBudget: 60000, nonRent: 20000 },
    weights: { cost_of_living: 25, noise: 20, local_services: 20, hospital: 10, park: 10, bus_stop: 5, pharmacy: 10 }
  }
];
