export type Recipe = {
  "Recipe Name": string;
  "Required Ingredients": string[];
  Instructions: string;
  "Prep Time": string;
};

export const recipes: Recipe[] = [
  {
    "Recipe Name": "Aloo Gobi",
    "Required Ingredients": ["potato", "cauliflower", "onion", "tomato", "ginger", "garlic", "turmeric", "cumin", "coriander", "oil"],
    Instructions: "Sauté cumin in oil, add onion, ginger, garlic. Add tomato and spices. Toss in potato and cauliflower, cover and cook until tender. Garnish with coriander.",
    "Prep Time": "35 min",
  },
  {
    "Recipe Name": "Dal Tadka",
    "Required Ingredients": ["toor dal", "onion", "tomato", "ginger", "garlic", "turmeric", "cumin", "mustard seeds", "ghee", "chili"],
    Instructions: "Pressure cook dal with turmeric. Prepare a tadka of ghee, cumin, mustard seeds, garlic, onion and tomato. Pour over dal and simmer 5 min.",
    "Prep Time": "30 min",
  },
  {
    "Recipe Name": "Paneer Butter Masala",
    "Required Ingredients": ["paneer", "tomato", "onion", "cashew", "butter", "cream", "ginger", "garlic", "garam masala", "kasuri methi"],
    Instructions: "Blend cooked tomato, onion, cashew into a smooth gravy. Cook in butter with spices, add cream, kasuri methi and paneer cubes. Simmer 5 min.",
    "Prep Time": "40 min",
  },
  {
    "Recipe Name": "Chicken Curry",
    "Required Ingredients": ["chicken", "onion", "tomato", "yogurt", "ginger", "garlic", "garam masala", "turmeric", "chili powder", "oil"],
    Instructions: "Brown onions in oil, add ginger garlic paste, then chicken. Add tomato, yogurt and spices. Simmer covered 25 min until tender.",
    "Prep Time": "45 min",
  },
  {
    "Recipe Name": "Vegetable Biryani",
    "Required Ingredients": ["basmati rice", "carrot", "peas", "potato", "onion", "yogurt", "mint", "coriander", "biryani masala", "ghee"],
    Instructions: "Parboil rice with whole spices. Cook vegetables in yogurt and biryani masala. Layer rice and veggies, top with mint and fried onions. Dum cook 20 min.",
    "Prep Time": "55 min",
  },
  {
    "Recipe Name": "Rajma Masala",
    "Required Ingredients": ["kidney beans", "onion", "tomato", "ginger", "garlic", "cumin", "garam masala", "chili powder", "coriander", "oil"],
    Instructions: "Soak and pressure cook rajma. Sauté onion, ginger, garlic, tomato with spices. Add rajma with stock and simmer 20 min until thick.",
    "Prep Time": "50 min",
  },
  {
    "Recipe Name": "Palak Paneer",
    "Required Ingredients": ["spinach", "paneer", "onion", "tomato", "ginger", "garlic", "cream", "cumin", "garam masala", "butter"],
    Instructions: "Blanch and puree spinach. Sauté onion, ginger, garlic, tomato in butter, add puree, spices and paneer. Finish with cream.",
    "Prep Time": "30 min",
  },
  {
    "Recipe Name": "Chana Masala",
    "Required Ingredients": ["chickpeas", "onion", "tomato", "ginger", "garlic", "cumin", "coriander", "garam masala", "chili powder", "oil"],
    Instructions: "Cook chickpeas till soft. Sauté onion, ginger, garlic, tomato with spices, add chickpeas and simmer 15 min. Garnish with coriander.",
    "Prep Time": "40 min",
  },
  {
    "Recipe Name": "Jeera Aloo",
    "Required Ingredients": ["potato", "cumin", "turmeric", "chili powder", "coriander", "oil", "salt"],
    Instructions: "Boil potatoes and cube. Temper cumin in oil, add turmeric and chili. Toss potatoes till crisp. Garnish with coriander.",
    "Prep Time": "20 min",
  },
  {
    "Recipe Name": "Masala Omelette",
    "Required Ingredients": ["egg", "onion", "tomato", "chili", "coriander", "turmeric", "salt", "oil"],
    Instructions: "Whisk eggs with chopped onion, tomato, chili, coriander, turmeric and salt. Cook in oil until set, fold and serve hot.",
    "Prep Time": "10 min",
  },
];