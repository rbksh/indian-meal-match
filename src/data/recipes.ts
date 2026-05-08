export type Recipe = {
  "Recipe Name": string;
  "Required Ingredients": string[];
  Instructions: string;
  "Prep Time": string;
};

export const recipes: Recipe[] = [
  {
    "Recipe Name": "Aloo Gobi",
    "Required Ingredients": ["aloo", "gobi", "pyaz", "tamatar", "adrak", "lehsun", "haldi", "jeera", "dhaniya", "tel"],
    Instructions: "Sauté cumin in oil, add onion, ginger, garlic. Add tomato and spices. Toss in potato and cauliflower, cover and cook until tender. Garnish with coriander.",
    "Prep Time": "35 min",
  },
  {
    "Recipe Name": "Dal Tadka",
    "Required Ingredients": ["toor dal", "pyaz", "tamatar", "adrak", "lehsun", "haldi", "jeera", "rai", "ghee", "mirchi", "hing"],
    Instructions: "Pressure cook dal with turmeric. Prepare a tadka of ghee, cumin, mustard seeds, garlic, onion and tomato. Pour over dal and simmer 5 min.",
    "Prep Time": "30 min",
  },
  {
    "Recipe Name": "Paneer Butter Masala",
    "Required Ingredients": ["paneer", "tamatar", "pyaz", "kaju", "makhan", "malai", "adrak", "lehsun", "garam masala", "kasuri methi"],
    Instructions: "Blend cooked tomato, onion, cashew into a smooth gravy. Cook in butter with spices, add cream, kasuri methi and paneer cubes. Simmer 5 min.",
    "Prep Time": "40 min",
  },
  {
    "Recipe Name": "Chicken Curry",
    "Required Ingredients": ["chicken", "pyaz", "tamatar", "dahi", "adrak", "lehsun", "garam masala", "haldi", "lal mirch", "tel"],
    Instructions: "Brown onions in oil, add ginger garlic paste, then chicken. Add tomato, yogurt and spices. Simmer covered 25 min until tender.",
    "Prep Time": "45 min",
  },
  {
    "Recipe Name": "Vegetable Biryani",
    "Required Ingredients": ["basmati chawal", "gajar", "matar", "aloo", "pyaz", "dahi", "pudina", "dhaniya", "biryani masala", "ghee"],
    Instructions: "Parboil rice with whole spices. Cook vegetables in yogurt and biryani masala. Layer rice and veggies, top with mint and fried onions. Dum cook 20 min.",
    "Prep Time": "55 min",
  },
  {
    "Recipe Name": "Rajma Masala",
    "Required Ingredients": ["rajma", "pyaz", "tamatar", "adrak", "lehsun", "jeera", "garam masala", "lal mirch", "dhaniya", "tel", "hing"],
    Instructions: "Soak and pressure cook rajma. Sauté onion, ginger, garlic, tomato with spices. Add rajma with stock and simmer 20 min until thick.",
    "Prep Time": "50 min",
  },
  {
    "Recipe Name": "Palak Paneer",
    "Required Ingredients": ["palak", "paneer", "pyaz", "tamatar", "adrak", "lehsun", "malai", "jeera", "garam masala", "makhan", "kasuri methi"],
    Instructions: "Blanch and puree spinach. Sauté onion, ginger, garlic, tomato in butter, add puree, spices and paneer. Finish with cream.",
    "Prep Time": "30 min",
  },
  {
    "Recipe Name": "Chana Masala",
    "Required Ingredients": ["chana", "pyaz", "tamatar", "adrak", "lehsun", "jeera", "dhaniya", "garam masala", "lal mirch", "tel", "anardana"],
    Instructions: "Cook chickpeas till soft. Sauté onion, ginger, garlic, tomato with spices, add chickpeas and simmer 15 min. Garnish with coriander.",
    "Prep Time": "40 min",
  },
  {
    "Recipe Name": "Jeera Aloo",
    "Required Ingredients": ["aloo", "jeera", "haldi", "lal mirch", "dhaniya", "tel", "namak", "hing"],
    Instructions: "Boil potatoes and cube. Temper cumin in oil, add turmeric and chili. Toss potatoes till crisp. Garnish with coriander.",
    "Prep Time": "20 min",
  },
  {
    "Recipe Name": "Masala Omelette",
    "Required Ingredients": ["anda", "pyaz", "tamatar", "hari mirch", "dhaniya", "haldi", "namak", "tel"],
    Instructions: "Whisk eggs with chopped onion, tomato, chili, coriander, turmeric and salt. Cook in oil until set, fold and serve hot.",
    "Prep Time": "10 min",
  },
];