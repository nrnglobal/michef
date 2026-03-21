-- ============================================
-- Casa Cook - Seed Data
-- Migration 002: Recipes, Rules, Fridge Staples
-- ============================================

-- ============================================
-- RECIPES (32 recipes)
-- ============================================

INSERT INTO recipes (title_en, title_es, description_en, description_es, category, protein_type, prep_time_minutes, servings, tags, ingredients, instructions_en, instructions_es, is_active) VALUES

-- SNACKS (4)
(
  'Guacamole with Veggie Sticks',
  'Guacamole con Bastones de Verduras',
  'Creamy homemade guacamole served with fresh vegetable sticks for dipping.',
  'Guacamole casero cremoso servido con bastones de verduras frescas.',
  'snacks', NULL, 15, 4,
  ARRAY['healthy', 'vegan', 'gluten-free', 'quick'],
  '[{"name_en":"ripe avocados","name_es":"aguacates maduros","quantity":"3","unit":"piece"},{"name_en":"lime","name_es":"lima","quantity":"1","unit":"piece"},{"name_en":"red onion","name_es":"cebolla roja","quantity":"0.25","unit":"cup"},{"name_en":"jalapeño","name_es":"jalapeño","quantity":"1","unit":"piece"},{"name_en":"fresh cilantro","name_es":"cilantro fresco","quantity":"2","unit":"tbsp"},{"name_en":"salt","name_es":"sal","quantity":"0.5","unit":"tsp"},{"name_en":"carrots","name_es":"zanahorias","quantity":"2","unit":"piece"},{"name_en":"celery","name_es":"apio","quantity":"2","unit":"piece"},{"name_en":"cucumber","name_es":"pepino","quantity":"1","unit":"piece"}]',
  'Cut avocados in half and remove pits. Scoop flesh into a bowl. Mash with a fork to desired consistency. Stir in lime juice, finely diced red onion, minced jalapeño, chopped cilantro, and salt. Taste and adjust seasoning. Cut carrots, celery, and cucumber into sticks. Serve guacamole with vegetable sticks.',
  'Corta los aguacates por la mitad y quita los huesos. Saca la pulpa en un bol. Aplasta con un tenedor hasta la consistencia deseada. Mezcla con jugo de lima, cebolla roja finamente picada, jalapeño picado, cilantro picado y sal. Prueba y ajusta el sabor. Corta zanahorias, apio y pepino en bastones. Sirve el guacamole con los bastones de verduras.',
  true
),

(
  'Cheese and Charcuterie Board',
  'Tabla de Quesos y Embutidos',
  'An elegant selection of cheeses, cured meats, olives, and crackers perfect for entertaining.',
  'Una elegante selección de quesos, embutidos, aceitunas y galletas, perfecta para entretener.',
  'snacks', NULL, 20, 6,
  ARRAY['entertaining', 'no-cook', 'crowd-pleaser'],
  '[{"name_en":"manchego cheese","name_es":"queso manchego","quantity":"200","unit":"g"},{"name_en":"brie cheese","name_es":"queso brie","quantity":"150","unit":"g"},{"name_en":"cheddar","name_es":"cheddar","quantity":"150","unit":"g"},{"name_en":"prosciutto","name_es":"prosciutto","quantity":"100","unit":"g"},{"name_en":"chorizo","name_es":"chorizo","quantity":"100","unit":"g"},{"name_en":"mixed olives","name_es":"aceitunas mixtas","quantity":"0.5","unit":"cup"},{"name_en":"crackers","name_es":"galletas saladas","quantity":"1","unit":"pkg"},{"name_en":"walnuts","name_es":"nueces","quantity":"0.25","unit":"cup"},{"name_en":"honey","name_es":"miel","quantity":"2","unit":"tbsp"},{"name_en":"grapes","name_es":"uvas","quantity":"1","unit":"cup"}]',
  'Arrange cheeses on a large wooden board, spacing them out. Fold or roll prosciutto and chorizo slices and place between cheeses. Fill gaps with olives, crackers, and walnuts. Add clusters of grapes for freshness. Drizzle honey over brie or serve in a small bowl. Let cheeses come to room temperature 30 minutes before serving for best flavor.',
  'Coloca los quesos en una tabla de madera grande, dejando espacio entre ellos. Dobla o enrolla las lonchas de prosciutto y chorizo y colócalas entre los quesos. Rellena los huecos con aceitunas, galletas y nueces. Agrega racimos de uvas para frescura. Rocía miel sobre el brie o sírvela en un cuenco pequeño. Deja los quesos a temperatura ambiente 30 minutos antes de servir para mejor sabor.',
  true
),

(
  'Stuffed Mini Peppers',
  'Pimientos Mini Rellenos',
  'Colorful mini sweet peppers stuffed with herbed cream cheese.',
  'Coloridos pimientos mini dulces rellenos con queso crema con hierbas.',
  'snacks', NULL, 20, 4,
  ARRAY['vegetarian', 'colorful', 'party'],
  '[{"name_en":"mini sweet peppers","name_es":"pimientos mini dulces","quantity":"12","unit":"piece"},{"name_en":"cream cheese","name_es":"queso crema","quantity":"200","unit":"g"},{"name_en":"fresh chives","name_es":"cebollino fresco","quantity":"2","unit":"tbsp"},{"name_en":"garlic","name_es":"ajo","quantity":"1","unit":"piece"},{"name_en":"salt and pepper","name_es":"sal y pimienta","quantity":"","unit":""},{"name_en":"smoked paprika","name_es":"pimentón ahumado","quantity":"1","unit":"tsp"}]',
  'Cut mini peppers in half lengthwise and remove seeds. In a bowl, mix softened cream cheese with minced garlic, finely chopped chives, salt, and pepper. Fill each pepper half with cream cheese mixture using a small spoon or piping bag. Dust with smoked paprika. Refrigerate for 30 minutes before serving.',
  'Corta los pimientos mini a la mitad a lo largo y quita las semillas. En un bol, mezcla el queso crema ablandado con ajo picado, cebollino finamente picado, sal y pimienta. Rellena cada mitad de pimiento con la mezcla de queso crema usando una cuchara pequeña o manga pastelera. Espolvorea con pimentón ahumado. Refrigera 30 minutos antes de servir.',
  true
),

(
  'Spiced Nuts Mix',
  'Mix de Frutos Secos Especiados',
  'Warm oven-roasted mixed nuts with honey, rosemary, and a hint of cayenne.',
  'Frutos secos mixtos asados al horno con miel, romero y un toque de cayena.',
  'snacks', NULL, 25, 8,
  ARRAY['vegan', 'gluten-free', 'make-ahead', 'snack'],
  '[{"name_en":"mixed nuts","name_es":"frutos secos mixtos","quantity":"3","unit":"cup"},{"name_en":"honey","name_es":"miel","quantity":"2","unit":"tbsp"},{"name_en":"olive oil","name_es":"aceite de oliva","quantity":"1","unit":"tbsp"},{"name_en":"fresh rosemary","name_es":"romero fresco","quantity":"1","unit":"tbsp"},{"name_en":"cayenne pepper","name_es":"cayena","quantity":"0.25","unit":"tsp"},{"name_en":"sea salt","name_es":"sal marina","quantity":"1","unit":"tsp"},{"name_en":"brown sugar","name_es":"azúcar moreno","quantity":"1","unit":"tbsp"}]',
  'Preheat oven to 325°F (165°C). In a bowl, whisk together honey, olive oil, chopped rosemary, cayenne, salt, and brown sugar. Add nuts and toss to coat thoroughly. Spread on a parchment-lined baking sheet in a single layer. Roast for 20-25 minutes, stirring halfway through, until golden. Let cool completely before serving — they crisp as they cool.',
  'Precalienta el horno a 165°C. En un bol, mezcla la miel, el aceite de oliva, el romero picado, la cayena, la sal y el azúcar moreno. Agrega los frutos secos y mezcla bien para cubrir. Extiende en una bandeja forrada con papel de horno en una sola capa. Asa durante 20-25 minutos, removiendo a la mitad, hasta que estén dorados. Deja enfriar completamente antes de servir — se vuelven crujientes al enfriarse.',
  true
),

-- VEGGIES (5)
(
  'Roasted Mediterranean Vegetables',
  'Verduras Mediterráneas Asadas',
  'A colorful mix of seasonal vegetables roasted with olive oil, garlic, and herbs.',
  'Una colorida mezcla de verduras de temporada asadas con aceite de oliva, ajo y hierbas.',
  'veggies', NULL, 40, 4,
  ARRAY['vegan', 'gluten-free', 'mediterranean', 'healthy'],
  '[{"name_en":"zucchini","name_es":"calabacín","quantity":"2","unit":"piece"},{"name_en":"red bell pepper","name_es":"pimiento rojo","quantity":"1","unit":"piece"},{"name_en":"yellow bell pepper","name_es":"pimiento amarillo","quantity":"1","unit":"piece"},{"name_en":"eggplant","name_es":"berenjena","quantity":"1","unit":"piece"},{"name_en":"cherry tomatoes","name_es":"tomates cherry","quantity":"1","unit":"cup"},{"name_en":"red onion","name_es":"cebolla roja","quantity":"1","unit":"piece"},{"name_en":"garlic cloves","name_es":"dientes de ajo","quantity":"4","unit":"piece"},{"name_en":"olive oil","name_es":"aceite de oliva","quantity":"4","unit":"tbsp"},{"name_en":"fresh thyme","name_es":"tomillo fresco","quantity":"3","unit":"tbsp"},{"name_en":"dried oregano","name_es":"orégano seco","quantity":"1","unit":"tsp"},{"name_en":"salt and pepper","name_es":"sal y pimienta","quantity":"","unit":""}]',
  'Preheat oven to 425°F (220°C). Chop zucchini, bell peppers, eggplant, and red onion into similar-sized chunks. Place all vegetables on a large baking sheet. Add whole garlic cloves. Drizzle with olive oil and season with thyme, oregano, salt, and pepper. Toss to coat. Roast for 25-30 minutes, turning once halfway through, until edges are caramelized and tender.',
  'Precalienta el horno a 220°C. Corta el calabacín, los pimientos, la berenjena y la cebolla roja en trozos de tamaño similar. Coloca todas las verduras en una bandeja grande para horno. Agrega los dientes de ajo enteros. Rocía con aceite de oliva y sazona con tomillo, orégano, sal y pimienta. Mezcla bien. Asa durante 25-30 minutos, girando a la mitad, hasta que los bordes estén caramelizados y tiernos.',
  true
),

(
  'Creamed Spinach',
  'Espinacas a la Crema',
  'Classic steakhouse-style creamed spinach with garlic and parmesan.',
  'Espinacas estilo asador clásico con ajo y parmesano.',
  'veggies', NULL, 20, 4,
  ARRAY['vegetarian', 'comfort', 'quick'],
  '[{"name_en":"fresh spinach","name_es":"espinacas frescas","quantity":"500","unit":"g"},{"name_en":"butter","name_es":"mantequilla","quantity":"2","unit":"tbsp"},{"name_en":"garlic","name_es":"ajo","quantity":"3","unit":"piece"},{"name_en":"heavy cream","name_es":"nata para cocinar","quantity":"0.5","unit":"cup"},{"name_en":"parmesan","name_es":"parmesano","quantity":"0.25","unit":"cup"},{"name_en":"nutmeg","name_es":"nuez moscada","quantity":"0.25","unit":"tsp"},{"name_en":"salt and pepper","name_es":"sal y pimienta","quantity":"","unit":""}]',
  'Wilt spinach in a large pan over medium heat with a splash of water. Drain and squeeze out excess liquid. In same pan, melt butter and sauté minced garlic until fragrant, about 1 minute. Add heavy cream and bring to a simmer. Stir in parmesan and nutmeg. Add spinach back and toss to coat. Season with salt and pepper. Simmer 2-3 minutes until sauce thickens.',
  'Sofría las espinacas en una sartén grande a fuego medio con un poco de agua. Escurre y exprímelas para quitar el exceso de líquido. En la misma sartén, derrite la mantequilla y sofríe el ajo picado hasta que esté fragante, unos 1 minuto. Agrega la nata y lleva a ebullición suave. Incorpora el parmesano y la nuez moscada. Agrega las espinacas y mezcla. Sazona con sal y pimienta. Cocina a fuego lento 2-3 minutos hasta que la salsa espese.',
  true
),

(
  'Ratatouille',
  'Ratatouille',
  'Classic French Provençal vegetable stew with tomatoes, zucchini, and eggplant.',
  'Estofado clásico de verduras de la Provenza francesa con tomates, calabacín y berenjena.',
  'veggies', NULL, 60, 6,
  ARRAY['vegan', 'french', 'make-ahead', 'gluten-free'],
  '[{"name_en":"eggplant","name_es":"berenjena","quantity":"1","unit":"piece"},{"name_en":"zucchini","name_es":"calabacín","quantity":"2","unit":"piece"},{"name_en":"yellow squash","name_es":"calabaza amarilla","quantity":"1","unit":"piece"},{"name_en":"tomatoes","name_es":"tomates","quantity":"4","unit":"piece"},{"name_en":"red bell pepper","name_es":"pimiento rojo","quantity":"1","unit":"piece"},{"name_en":"onion","name_es":"cebolla","quantity":"1","unit":"piece"},{"name_en":"garlic","name_es":"ajo","quantity":"4","unit":"piece"},{"name_en":"olive oil","name_es":"aceite de oliva","quantity":"4","unit":"tbsp"},{"name_en":"fresh basil","name_es":"albahaca fresca","quantity":"0.25","unit":"cup"},{"name_en":"herbes de Provence","name_es":"hierbas de Provenza","quantity":"1","unit":"tsp"},{"name_en":"salt and pepper","name_es":"sal y pimienta","quantity":"","unit":""}]',
  'Slice all vegetables into uniform rounds. In a large oven-safe pot, heat 2 tbsp olive oil and sauté diced onion and garlic until soft. Add crushed tomatoes and herbes de Provence, cook 10 minutes to form a sauce base. Arrange sliced vegetables in overlapping circles on top of the sauce. Drizzle with remaining olive oil and season. Cover and bake at 375°F (190°C) for 40 minutes. Uncover and cook 10 more minutes. Garnish with fresh basil.',
  'Corta todas las verduras en rodajas uniformes. En una olla grande apta para horno, calienta 2 cucharadas de aceite y sofríe la cebolla picada y el ajo hasta que estén blandos. Agrega los tomates triturados y las hierbas de Provenza, cocina 10 minutos para formar una base de salsa. Coloca las verduras en rodajas en círculos superpuestos sobre la salsa. Rocía con el aceite restante y sazona. Cubre y hornea a 190°C durante 40 minutos. Destapa y cocina 10 minutos más. Decora con albahaca fresca.',
  true
),

(
  'Cauliflower Steaks with Chimichurri',
  'Filetes de Coliflor con Chimichurri',
  'Thick-cut cauliflower steaks roasted golden and served with bright herb chimichurri.',
  'Gruesos filetes de coliflor asados hasta dorar y servidos con chimichurri de hierbas.',
  'veggies', NULL, 35, 4,
  ARRAY['vegan', 'gluten-free', 'impressive', 'argentinian'],
  '[{"name_en":"large cauliflower","name_es":"coliflor grande","quantity":"1","unit":"piece"},{"name_en":"olive oil","name_es":"aceite de oliva","quantity":"4","unit":"tbsp"},{"name_en":"garlic powder","name_es":"ajo en polvo","quantity":"1","unit":"tsp"},{"name_en":"smoked paprika","name_es":"pimentón ahumado","quantity":"1","unit":"tsp"},{"name_en":"fresh parsley","name_es":"perejil fresco","quantity":"1","unit":"cup"},{"name_en":"fresh oregano","name_es":"orégano fresco","quantity":"2","unit":"tbsp"},{"name_en":"garlic","name_es":"ajo","quantity":"3","unit":"piece"},{"name_en":"red wine vinegar","name_es":"vinagre de vino tinto","quantity":"2","unit":"tbsp"},{"name_en":"red pepper flakes","name_es":"hojuelas de chile","quantity":"0.25","unit":"tsp"},{"name_en":"salt","name_es":"sal","quantity":"1","unit":"tsp"}]',
  'Preheat oven to 425°F (220°C). Slice cauliflower vertically into 1-inch thick steaks. Brush both sides with olive oil mixed with garlic powder and paprika. Season with salt. Roast on a baking sheet for 25-30 minutes, flipping halfway, until golden and tender. For chimichurri: blend parsley, oregano, garlic, red wine vinegar, red pepper flakes, salt, and remaining olive oil until chunky. Spoon chimichurri over cauliflower steaks to serve.',
  'Precalienta el horno a 220°C. Corta la coliflor verticalmente en filetes de 2.5 cm de grosor. Unta ambos lados con aceite de oliva mezclado con ajo en polvo y pimentón. Sazona con sal. Asa en una bandeja de horno durante 25-30 minutos, girando a la mitad, hasta que estén dorados y tiernos. Para el chimichurri: mezcla perejil, orégano, ajo, vinagre de vino tinto, hojuelas de chile, sal y el aceite restante hasta obtener una textura gruesa. Sirve los filetes de coliflor con el chimichurri por encima.',
  true
),

(
  'Stir-Fried Bok Choy with Ginger',
  'Bok Choy Salteado con Jengibre',
  'Quick and delicious Asian-inspired stir-fried bok choy with garlic, ginger, and soy sauce.',
  'Rápido y delicioso bok choy salteado de inspiración asiática con ajo, jengibre y salsa de soja.',
  'veggies', NULL, 15, 4,
  ARRAY['vegan', 'asian', 'quick', 'healthy'],
  '[{"name_en":"baby bok choy","name_es":"bok choy baby","quantity":"4","unit":"piece"},{"name_en":"garlic","name_es":"ajo","quantity":"3","unit":"piece"},{"name_en":"fresh ginger","name_es":"jengibre fresco","quantity":"1","unit":"tbsp"},{"name_en":"sesame oil","name_es":"aceite de sésamo","quantity":"1","unit":"tbsp"},{"name_en":"soy sauce","name_es":"salsa de soja","quantity":"2","unit":"tbsp"},{"name_en":"oyster sauce","name_es":"salsa de ostras","quantity":"1","unit":"tbsp"},{"name_en":"vegetable oil","name_es":"aceite vegetal","quantity":"2","unit":"tbsp"},{"name_en":"sesame seeds","name_es":"semillas de sésamo","quantity":"1","unit":"tbsp"}]',
  'Halve bok choy lengthwise. Heat vegetable oil in a wok or large pan over high heat. Add minced garlic and grated ginger, stir fry 30 seconds until fragrant. Add bok choy cut side down and cook 2 minutes without moving. Flip and add soy sauce and oyster sauce. Toss and cook 1-2 minutes more until stems are tender but still have crunch. Drizzle with sesame oil and garnish with sesame seeds.',
  'Corta el bok choy a la mitad a lo largo. Calienta el aceite vegetal en un wok o sartén grande a fuego alto. Agrega el ajo picado y el jengibre rallado, saltea 30 segundos hasta que estén fragantes. Coloca el bok choy con el lado cortado hacia abajo y cocina 2 minutos sin mover. Voltea y agrega la salsa de soja y la salsa de ostras. Mezcla y cocina 1-2 minutos más hasta que los tallos estén tiernos pero crujientes. Rocía con aceite de sésamo y decora con semillas de sésamo.',
  true
),

-- CARBS (4)
(
  'Garlic Herb Roasted Potatoes',
  'Patatas Asadas con Ajo y Hierbas',
  'Crispy golden roasted potatoes with garlic, rosemary, and thyme.',
  'Patatas asadas crujientes y doradas con ajo, romero y tomillo.',
  'carbs', NULL, 45, 4,
  ARRAY['vegan', 'gluten-free', 'comfort', 'crowd-pleaser'],
  '[{"name_en":"baby potatoes","name_es":"patatas baby","quantity":"1","unit":"kg"},{"name_en":"garlic cloves","name_es":"dientes de ajo","quantity":"6","unit":"piece"},{"name_en":"fresh rosemary","name_es":"romero fresco","quantity":"2","unit":"tbsp"},{"name_en":"fresh thyme","name_es":"tomillo fresco","quantity":"2","unit":"tbsp"},{"name_en":"olive oil","name_es":"aceite de oliva","quantity":"4","unit":"tbsp"},{"name_en":"salt and pepper","name_es":"sal y pimienta","quantity":"","unit":""},{"name_en":"parsley","name_es":"perejil","quantity":"2","unit":"tbsp"}]',
  'Preheat oven to 425°F (220°C). Halve potatoes and parboil in salted water for 8 minutes. Drain and let steam dry for 2 minutes. Transfer to a baking sheet, add whole garlic cloves, rosemary, and thyme. Drizzle generously with olive oil and season with salt and pepper. Toss to coat. Roast for 25-30 minutes, turning once, until golden and crispy. Garnish with fresh parsley.',
  'Precalienta el horno a 220°C. Corta las patatas por la mitad y cocínalas previamente en agua salada durante 8 minutos. Escurre y deja secar al vapor 2 minutos. Colócalas en una bandeja de horno, agrega los dientes de ajo enteros, el romero y el tomillo. Rocía generosamente con aceite de oliva y sazona con sal y pimienta. Mezcla bien. Asa durante 25-30 minutos, girando una vez, hasta que estén doradas y crujientes. Decora con perejil fresco.',
  true
),

(
  'Pasta Primavera',
  'Pasta Primavera',
  'Light and fresh pasta with seasonal vegetables in a light white wine and parmesan sauce.',
  'Pasta ligera y fresca con verduras de temporada en una salsa ligera de vino blanco y parmesano.',
  'carbs', NULL, 30, 4,
  ARRAY['vegetarian', 'italian', 'fresh', 'quick'],
  '[{"name_en":"penne pasta","name_es":"pasta penne","quantity":"400","unit":"g"},{"name_en":"asparagus","name_es":"espárragos","quantity":"200","unit":"g"},{"name_en":"cherry tomatoes","name_es":"tomates cherry","quantity":"1","unit":"cup"},{"name_en":"zucchini","name_es":"calabacín","quantity":"1","unit":"piece"},{"name_en":"peas","name_es":"guisantes","quantity":"0.5","unit":"cup"},{"name_en":"garlic","name_es":"ajo","quantity":"3","unit":"piece"},{"name_en":"white wine","name_es":"vino blanco","quantity":"0.5","unit":"cup"},{"name_en":"parmesan","name_es":"parmesano","quantity":"0.5","unit":"cup"},{"name_en":"olive oil","name_es":"aceite de oliva","quantity":"3","unit":"tbsp"},{"name_en":"fresh basil","name_es":"albahaca fresca","quantity":"0.25","unit":"cup"},{"name_en":"lemon","name_es":"limón","quantity":"1","unit":"piece"}]',
  'Cook pasta in heavily salted boiling water until al dente. Reserve 1 cup pasta water before draining. Heat olive oil in a large skillet over medium-high heat. Sauté garlic until fragrant. Add asparagus and zucchini, cook 3 minutes. Add cherry tomatoes and peas, cook 2 more minutes. Pour in white wine and let reduce by half. Add drained pasta and parmesan, tossing to combine. Add pasta water as needed to loosen sauce. Finish with lemon zest, lemon juice, and fresh basil.',
  'Cocina la pasta en agua hirviendo con mucha sal hasta que esté al dente. Reserva 1 taza del agua de cocción antes de escurrir. Calienta el aceite de oliva en una sartén grande a fuego medio-alto. Sofríe el ajo hasta que esté fragante. Agrega los espárragos y el calabacín, cocina 3 minutos. Agrega los tomates cherry y los guisantes, cocina 2 minutos más. Vierte el vino blanco y deja reducir a la mitad. Agrega la pasta escurrida y el parmesano, mezclando para combinar. Agrega agua de cocción según sea necesario. Termina con ralladura de limón, jugo de limón y albahaca fresca.',
  true
),

(
  'Quinoa Tabbouleh',
  'Tabulé de Quinoa',
  'A Middle Eastern-inspired salad with quinoa instead of bulgur, loaded with herbs and lemon.',
  'Una ensalada de inspiración mediterránea con quinoa en lugar de bulgur, llena de hierbas y limón.',
  'carbs', NULL, 30, 4,
  ARRAY['vegan', 'gluten-free', 'middle-eastern', 'healthy', 'make-ahead'],
  '[{"name_en":"quinoa","name_es":"quinoa","quantity":"1","unit":"cup"},{"name_en":"fresh parsley","name_es":"perejil fresco","quantity":"2","unit":"cup"},{"name_en":"fresh mint","name_es":"menta fresca","quantity":"0.5","unit":"cup"},{"name_en":"cherry tomatoes","name_es":"tomates cherry","quantity":"1","unit":"cup"},{"name_en":"cucumber","name_es":"pepino","quantity":"1","unit":"piece"},{"name_en":"green onions","name_es":"cebolleta","quantity":"4","unit":"piece"},{"name_en":"lemon juice","name_es":"zumo de limón","quantity":"0.25","unit":"cup"},{"name_en":"olive oil","name_es":"aceite de oliva","quantity":"3","unit":"tbsp"},{"name_en":"salt and pepper","name_es":"sal y pimienta","quantity":"","unit":""}]',
  'Cook quinoa in 2 cups water with a pinch of salt. Bring to boil, reduce heat, cover and simmer 15 minutes. Fluff and let cool completely. Finely chop parsley, mint, and green onions. Dice tomatoes and cucumber. In a large bowl, combine cooled quinoa with all vegetables and herbs. Dress with lemon juice and olive oil. Season with salt and pepper. Refrigerate for at least 30 minutes before serving to let flavors meld.',
  'Cocina la quinoa en 2 tazas de agua con una pizca de sal. Lleva a ebullición, reduce el fuego, cubre y cocina a fuego lento 15 minutos. Esponja y deja enfriar completamente. Pica finamente el perejil, la menta y la cebolleta. Trocea los tomates y el pepino. En un bol grande, combina la quinoa fría con todas las verduras y hierbas. Aliña con jugo de limón y aceite de oliva. Sazona con sal y pimienta. Refrigera al menos 30 minutos antes de servir para que los sabores se integren.',
  true
),

(
  'Sweet Potato Mash',
  'Puré de Boniato',
  'Silky smooth sweet potato mash with butter, maple syrup, and warming spices.',
  'Puré de boniato suave y sedoso con mantequilla, jarabe de arce y especias cálidas.',
  'carbs', NULL, 30, 4,
  ARRAY['vegetarian', 'gluten-free', 'comfort', 'healthy'],
  '[{"name_en":"sweet potatoes","name_es":"boniatos","quantity":"1","unit":"kg"},{"name_en":"butter","name_es":"mantequilla","quantity":"3","unit":"tbsp"},{"name_en":"maple syrup","name_es":"jarabe de arce","quantity":"2","unit":"tbsp"},{"name_en":"cinnamon","name_es":"canela","quantity":"0.5","unit":"tsp"},{"name_en":"nutmeg","name_es":"nuez moscada","quantity":"0.25","unit":"tsp"},{"name_en":"salt","name_es":"sal","quantity":"0.5","unit":"tsp"},{"name_en":"milk or cream","name_es":"leche o nata","quantity":"0.25","unit":"cup"}]',
  'Peel and cube sweet potatoes. Boil in salted water for 15-20 minutes until very tender. Drain thoroughly and return to pot over low heat for 1 minute to evaporate excess moisture. Mash until smooth. Beat in butter, maple syrup, cinnamon, and nutmeg. Add warm milk or cream gradually until desired consistency. Season with salt. Serve immediately with a pat of butter on top.',
  'Pela y corta en cubos los boniatos. Hierve en agua salada durante 15-20 minutos hasta que estén muy tiernos. Escurre bien y devuelve a la olla a fuego bajo 1 minuto para evaporar el exceso de humedad. Aplasta hasta obtener un puré suave. Incorpora la mantequilla, el jarabe de arce, la canela y la nuez moscada. Agrega la leche o nata caliente gradualmente hasta la consistencia deseada. Sazona con sal. Sirve inmediatamente con un trozo de mantequilla encima.',
  true
),

-- BEEF (6)
(
  'Classic Beef Burgers',
  'Hamburguesas Clásicas de Carne',
  'Juicy homemade beef burgers with all the classic toppings.',
  'Jugosas hamburguesas caseras de carne con todos los acompañamientos clásicos.',
  'beef', 'beef', 30, 4,
  ARRAY['american', 'grilling', 'crowd-pleaser', 'weekend'],
  '[{"name_en":"ground beef 80/20","name_es":"carne picada 80/20","quantity":"700","unit":"g"},{"name_en":"garlic powder","name_es":"ajo en polvo","quantity":"1","unit":"tsp"},{"name_en":"onion powder","name_es":"cebolla en polvo","quantity":"1","unit":"tsp"},{"name_en":"Worcestershire sauce","name_es":"salsa Worcestershire","quantity":"1","unit":"tbsp"},{"name_en":"salt and pepper","name_es":"sal y pimienta","quantity":"","unit":""},{"name_en":"brioche buns","name_es":"panecillos brioche","quantity":"4","unit":"piece"},{"name_en":"cheddar slices","name_es":"lonchas de cheddar","quantity":"4","unit":"piece"},{"name_en":"lettuce","name_es":"lechuga","quantity":"1","unit":"cup"},{"name_en":"tomato","name_es":"tomate","quantity":"1","unit":"piece"},{"name_en":"red onion","name_es":"cebolla roja","quantity":"0.5","unit":"piece"}]',
  'Mix ground beef with garlic powder, onion powder, Worcestershire sauce, salt, and pepper. Form into 4 equal patties about 3/4 inch thick. Make a small indent in center of each patty to prevent puffing. Heat grill or cast iron pan to high heat. Cook patties 3-4 minutes per side for medium. Add cheese in last minute and cover to melt. Toast buns. Assemble with lettuce, tomato, onion, and your favorite condiments.',
  'Mezcla la carne picada con ajo en polvo, cebolla en polvo, salsa Worcestershire, sal y pimienta. Forma 4 hamburguesas iguales de unos 2 cm de grosor. Haz una pequeña hendidura en el centro de cada una para evitar que se hinche. Calienta la parrilla o sartén de hierro a fuego alto. Cocina las hamburguesas 3-4 minutos por lado para término medio. Agrega el queso en el último minuto y cubre para derretirlo. Tuesta los panecillos. Monta con lechuga, tomate, cebolla y tus condimentos favoritos.',
  true
),

(
  'Beef and Vegetable Stir Fry',
  'Salteado de Carne y Verduras',
  'Quick and savory stir fry with tender beef strips and crisp vegetables in umami sauce.',
  'Salteado rápido y sabroso con tiras de carne tierna y verduras crujientes en salsa umami.',
  'beef', 'beef', 25, 4,
  ARRAY['asian', 'quick', 'healthy', 'weeknight'],
  '[{"name_en":"beef sirloin","name_es":"solomillo de res","quantity":"500","unit":"g"},{"name_en":"broccoli","name_es":"brócoli","quantity":"300","unit":"g"},{"name_en":"bell peppers","name_es":"pimientos","quantity":"2","unit":"piece"},{"name_en":"snap peas","name_es":"guisantes mollar","quantity":"1","unit":"cup"},{"name_en":"soy sauce","name_es":"salsa de soja","quantity":"3","unit":"tbsp"},{"name_en":"oyster sauce","name_es":"salsa de ostras","quantity":"2","unit":"tbsp"},{"name_en":"sesame oil","name_es":"aceite de sésamo","quantity":"1","unit":"tbsp"},{"name_en":"garlic","name_es":"ajo","quantity":"4","unit":"piece"},{"name_en":"fresh ginger","name_es":"jengibre fresco","quantity":"1","unit":"tbsp"},{"name_en":"cornstarch","name_es":"maicena","quantity":"1","unit":"tbsp"},{"name_en":"vegetable oil","name_es":"aceite vegetal","quantity":"3","unit":"tbsp"}]',
  'Slice beef against the grain into thin strips. Toss with cornstarch, half the soy sauce, and a pinch of pepper. Marinate 10 minutes. Mix remaining soy sauce, oyster sauce, and sesame oil for the sauce. Heat oil in wok over high heat until smoking. Stir fry beef in batches for 1-2 minutes until browned, remove. In same wok, add garlic and ginger for 30 seconds. Add vegetables and stir fry 3-4 minutes. Return beef, add sauce, toss everything together. Serve immediately over rice.',
  'Corta la carne en contra de la fibra en tiras finas. Mezcla con maicena, la mitad de la salsa de soja y una pizca de pimienta. Marina 10 minutos. Mezcla el resto de la salsa de soja, la salsa de ostras y el aceite de sésamo para la salsa. Calienta el aceite en un wok a fuego alto hasta que humee. Saltea la carne en tandas durante 1-2 minutos hasta que esté dorada, retira. En el mismo wok, agrega el ajo y el jengibre 30 segundos. Agrega las verduras y saltea 3-4 minutos. Devuelve la carne, agrega la salsa, mezcla todo. Sirve inmediatamente sobre arroz.',
  true
),

(
  'Slow-Cooked Beef Ragu',
  'Ragú de Carne a Fuego Lento',
  'Rich and tender beef ragu braised with red wine, tomatoes, and herbs.',
  'Ragú de carne rico y tierno estofado con vino tinto, tomates y hierbas.',
  'beef', 'beef', 180, 6,
  ARRAY['italian', 'slow-cook', 'make-ahead', 'special'],
  '[{"name_en":"beef chuck","name_es":"aguja de res","quantity":"1","unit":"kg"},{"name_en":"onion","name_es":"cebolla","quantity":"1","unit":"piece"},{"name_en":"carrots","name_es":"zanahorias","quantity":"2","unit":"piece"},{"name_en":"celery","name_es":"apio","quantity":"2","unit":"piece"},{"name_en":"garlic","name_es":"ajo","quantity":"5","unit":"piece"},{"name_en":"red wine","name_es":"vino tinto","quantity":"1","unit":"cup"},{"name_en":"crushed tomatoes","name_es":"tomates triturados","quantity":"400","unit":"g"},{"name_en":"beef broth","name_es":"caldo de res","quantity":"1","unit":"cup"},{"name_en":"fresh rosemary","name_es":"romero fresco","quantity":"2","unit":"tbsp"},{"name_en":"bay leaves","name_es":"hojas de laurel","quantity":"2","unit":"piece"},{"name_en":"olive oil","name_es":"aceite de oliva","quantity":"3","unit":"tbsp"}]',
  'Season beef generously with salt and pepper. Heat olive oil in a heavy pot over high heat. Sear beef on all sides until deeply browned, about 3-4 minutes per side. Remove. In same pot, sauté diced onion, carrot, celery, and garlic for 5 minutes. Pour in wine and scrape up browned bits. Return beef. Add tomatoes, broth, rosemary, and bay leaves. Bring to boil, then reduce to lowest simmer. Cover and cook 2.5-3 hours until beef falls apart. Shred beef with two forks and stir into sauce.',
  'Sazona la carne generosamente con sal y pimienta. Calienta el aceite de oliva en una olla pesada a fuego alto. Dora la carne por todos los lados hasta que esté muy dorada, unos 3-4 minutos por lado. Retira. En la misma olla, sofríe la cebolla, la zanahoria, el apio y el ajo picados durante 5 minutos. Vierte el vino y raspa los trozos dorados del fondo. Devuelve la carne. Agrega los tomates, el caldo, el romero y las hojas de laurel. Lleva a ebullición, luego reduce al mínimo. Cubre y cocina 2.5-3 horas hasta que la carne se deshaga. Deshebra la carne con dos tenedores y mezcla con la salsa.',
  true
),

(
  'Beef Tacos',
  'Tacos de Carne',
  'Seasoned ground beef tacos with fresh toppings and warm tortillas.',
  'Tacos de carne picada sazonada con toppings frescos y tortillas calientes.',
  'beef', 'beef', 25, 4,
  ARRAY['mexican', 'quick', 'family', 'crowd-pleaser'],
  '[{"name_en":"ground beef","name_es":"carne picada","quantity":"500","unit":"g"},{"name_en":"taco seasoning","name_es":"mezcla de especias para tacos","quantity":"2","unit":"tbsp"},{"name_en":"corn tortillas","name_es":"tortillas de maíz","quantity":"8","unit":"piece"},{"name_en":"shredded lettuce","name_es":"lechuga rallada","quantity":"1","unit":"cup"},{"name_en":"diced tomato","name_es":"tomate picado","quantity":"1","unit":"piece"},{"name_en":"sour cream","name_es":"crema agria","quantity":"0.5","unit":"cup"},{"name_en":"shredded cheese","name_es":"queso rallado","quantity":"0.5","unit":"cup"},{"name_en":"lime","name_es":"lima","quantity":"1","unit":"piece"},{"name_en":"avocado","name_es":"aguacate","quantity":"1","unit":"piece"}]',
  'Brown ground beef in a skillet over medium-high heat, breaking it apart. Drain excess fat. Add taco seasoning and 1/4 cup water. Stir and simmer 3-4 minutes until sauce thickens. Warm tortillas in a dry skillet or wrap in foil and heat in oven. Assemble tacos with seasoned beef and desired toppings: lettuce, tomato, sour cream, cheese, sliced avocado, and a squeeze of lime.',
  'Dora la carne picada en una sartén a fuego medio-alto, deshaciéndola. Escurre el exceso de grasa. Agrega el condimento para tacos y 1/4 de taza de agua. Mezcla y cocina a fuego lento 3-4 minutos hasta que la salsa espese. Calienta las tortillas en una sartén seca o envueltas en papel aluminio en el horno. Arma los tacos con la carne y los toppings deseados: lechuga, tomate, crema agria, queso, aguacate en rodajas y un chorrito de lima.',
  true
),

(
  'Beef Meatballs in Tomato Sauce',
  'Albóndigas de Carne en Salsa de Tomate',
  'Tender homemade beef meatballs simmered in a rich Italian tomato sauce.',
  'Tiernas albóndigas caseras de carne cocinadas a fuego lento en una rica salsa italiana de tomate.',
  'beef', 'beef', 50, 4,
  ARRAY['italian', 'comfort', 'make-ahead', 'family'],
  '[{"name_en":"ground beef","name_es":"carne picada","quantity":"500","unit":"g"},{"name_en":"breadcrumbs","name_es":"pan rallado","quantity":"0.5","unit":"cup"},{"name_en":"egg","name_es":"huevo","quantity":"1","unit":"piece"},{"name_en":"parmesan","name_es":"parmesano","quantity":"0.25","unit":"cup"},{"name_en":"garlic","name_es":"ajo","quantity":"4","unit":"piece"},{"name_en":"fresh parsley","name_es":"perejil fresco","quantity":"3","unit":"tbsp"},{"name_en":"crushed tomatoes","name_es":"tomates triturados","quantity":"800","unit":"g"},{"name_en":"onion","name_es":"cebolla","quantity":"1","unit":"piece"},{"name_en":"olive oil","name_es":"aceite de oliva","quantity":"3","unit":"tbsp"},{"name_en":"basil","name_es":"albahaca","quantity":"0.25","unit":"cup"},{"name_en":"red pepper flakes","name_es":"hojuelas de chile","quantity":"0.25","unit":"tsp"}]',
  'Mix ground beef with breadcrumbs, egg, half the parmesan, 2 garlic cloves, parsley, salt, and pepper. Roll into golf ball-sized meatballs. Brown in olive oil over medium-high heat on all sides, about 5 minutes. Remove. In same pan, sauté diced onion and remaining garlic. Add crushed tomatoes, red pepper flakes, and basil. Simmer 10 minutes. Return meatballs to sauce, cover, and simmer 20 minutes. Serve with remaining parmesan.',
  'Mezcla la carne picada con el pan rallado, el huevo, la mitad del parmesano, 2 dientes de ajo, el perejil, la sal y la pimienta. Forma albóndigas del tamaño de una pelota de golf. Dora en aceite de oliva a fuego medio-alto por todos los lados, unos 5 minutos. Retira. En la misma sartén, sofríe la cebolla picada y el ajo restante. Agrega los tomates triturados, las hojuelas de chile y la albahaca. Cocina a fuego lento 10 minutos. Devuelve las albóndigas a la salsa, cubre y cocina a fuego lento 20 minutos. Sirve con el parmesano restante.',
  true
),

(
  'Skirt Steak with Chimichurri',
  'Falda de Res con Chimichurri',
  'Perfectly seared skirt steak served with vibrant Argentinian chimichurri sauce.',
  'Falda de res perfectamente sellada servida con vibrante chimichurri argentino.',
  'beef', 'beef', 25, 4,
  ARRAY['argentinian', 'grilling', 'quick', 'gluten-free'],
  '[{"name_en":"skirt steak","name_es":"falda de res","quantity":"700","unit":"g"},{"name_en":"salt and pepper","name_es":"sal y pimienta","quantity":"","unit":""},{"name_en":"fresh parsley","name_es":"perejil fresco","quantity":"1","unit":"cup"},{"name_en":"fresh oregano","name_es":"orégano fresco","quantity":"2","unit":"tbsp"},{"name_en":"garlic","name_es":"ajo","quantity":"4","unit":"piece"},{"name_en":"red wine vinegar","name_es":"vinagre de vino tinto","quantity":"3","unit":"tbsp"},{"name_en":"olive oil","name_es":"aceite de oliva","quantity":"0.5","unit":"cup"},{"name_en":"red pepper flakes","name_es":"hojuelas de chile","quantity":"0.5","unit":"tsp"},{"name_en":"shallot","name_es":"chalota","quantity":"1","unit":"piece"}]',
  'Make chimichurri: finely chop parsley, oregano, garlic, and shallot. Mix with red wine vinegar, olive oil, red pepper flakes, and salt. Let sit at least 20 minutes. Pat steak dry and season generously with salt and pepper. Heat cast iron pan until smoking. Cook steak 3-4 minutes per side for medium-rare. Rest 5 minutes before slicing against the grain. Serve topped with chimichurri.',
  'Prepara el chimichurri: pica finamente el perejil, el orégano, el ajo y la chalota. Mezcla con vinagre de vino tinto, aceite de oliva, hojuelas de chile y sal. Deja reposar al menos 20 minutos. Seca el filete y sazona generosamente con sal y pimienta. Calienta una sartén de hierro hasta que humee. Cocina el filete 3-4 minutos por lado para término medio-poco. Deja reposar 5 minutos antes de cortar en contra de la fibra. Sirve cubierto con chimichurri.',
  true
),

-- CHICKEN (8)
(
  'Lemon Herb Roasted Chicken',
  'Pollo Asado con Limón y Hierbas',
  'Perfectly roasted whole chicken with crispy skin and juicy meat, infused with lemon and herbs.',
  'Pollo entero perfectamente asado con piel crujiente y carne jugosa, infusionado con limón y hierbas.',
  'chicken', 'chicken', 90, 6,
  ARRAY['classic', 'sunday-roast', 'gluten-free', 'impressive'],
  '[{"name_en":"whole chicken","name_es":"pollo entero","quantity":"1","unit":"piece"},{"name_en":"lemon","name_es":"limón","quantity":"2","unit":"piece"},{"name_en":"garlic","name_es":"ajo","quantity":"6","unit":"piece"},{"name_en":"fresh rosemary","name_es":"romero fresco","quantity":"3","unit":"tbsp"},{"name_en":"fresh thyme","name_es":"tomillo fresco","quantity":"3","unit":"tbsp"},{"name_en":"butter","name_es":"mantequilla","quantity":"4","unit":"tbsp"},{"name_en":"olive oil","name_es":"aceite de oliva","quantity":"2","unit":"tbsp"},{"name_en":"salt and pepper","name_es":"sal y pimienta","quantity":"","unit":""},{"name_en":"onion","name_es":"cebolla","quantity":"1","unit":"piece"}]',
  'Preheat oven to 425°F (220°C). Pat chicken dry. Mix softened butter with chopped herbs, lemon zest, salt, and pepper. Gently separate skin from breast and spread herb butter underneath. Season outside generously. Stuff cavity with halved lemon, garlic, and onion. Place in roasting pan breast-side up. Roast 20 minutes per pound plus 20 minutes, basting every 30 minutes. Rest 15 minutes before carving. Internal temp should reach 165°F (74°C).',
  'Precalienta el horno a 220°C. Seca el pollo. Mezcla la mantequilla ablandada con hierbas picadas, ralladura de limón, sal y pimienta. Separa cuidadosamente la piel de la pechuga y unta la mantequilla de hierbas debajo. Sazona el exterior generosamente. Rellena la cavidad con el limón cortado por la mitad, el ajo y la cebolla. Coloca en una bandeja de asar con la pechuga hacia arriba. Asa 20 minutos por libra más 20 minutos, rociando cada 30 minutos. Deja reposar 15 minutos antes de cortar. La temperatura interna debe alcanzar 74°C.',
  true
),

(
  'Chicken Tikka Masala',
  'Tikka Masala de Pollo',
  'Tender chicken in a rich, creamy spiced tomato sauce — an all-time crowd-pleaser.',
  'Pollo tierno en una rica salsa cremosa de tomate especiada — un clásico irresistible.',
  'chicken', 'chicken', 45, 4,
  ARRAY['indian', 'creamy', 'spiced', 'crowd-pleaser'],
  '[{"name_en":"chicken thighs boneless","name_es":"muslos de pollo sin hueso","quantity":"700","unit":"g"},{"name_en":"yogurt","name_es":"yogur","quantity":"0.5","unit":"cup"},{"name_en":"garam masala","name_es":"garam masala","quantity":"2","unit":"tsp"},{"name_en":"cumin","name_es":"comino","quantity":"1","unit":"tsp"},{"name_en":"turmeric","name_es":"cúrcuma","quantity":"0.5","unit":"tsp"},{"name_en":"canned tomatoes","name_es":"tomates en lata","quantity":"400","unit":"g"},{"name_en":"heavy cream","name_es":"nata para cocinar","quantity":"0.5","unit":"cup"},{"name_en":"onion","name_es":"cebolla","quantity":"1","unit":"piece"},{"name_en":"garlic","name_es":"ajo","quantity":"5","unit":"piece"},{"name_en":"fresh ginger","name_es":"jengibre fresco","quantity":"1","unit":"tbsp"},{"name_en":"butter","name_es":"mantequilla","quantity":"2","unit":"tbsp"},{"name_en":"cilantro","name_es":"cilantro","quantity":"0.25","unit":"cup"}]',
  'Marinate chicken in yogurt, half the spices, salt, and pepper for at least 30 minutes. Grill or broil chicken until charred and cooked through. In a large pan, heat butter and sauté onion until golden, 8 minutes. Add garlic and ginger, cook 2 minutes. Add remaining spices and cook 1 minute. Add crushed tomatoes and simmer 15 minutes. Blend sauce until smooth. Return to pan, add cream and cooked chicken. Simmer 10 minutes. Garnish with cilantro. Serve with basmati rice and naan.',
  'Marina el pollo en yogur, la mitad de las especias, sal y pimienta al menos 30 minutos. Asa el pollo hasta que esté tostado y completamente cocinado. En una sartén grande, derrite la mantequilla y sofríe la cebolla hasta que esté dorada, 8 minutos. Agrega el ajo y el jengibre, cocina 2 minutos. Agrega el resto de las especias y cocina 1 minuto. Agrega los tomates triturados y cocina a fuego lento 15 minutos. Mezcla la salsa hasta que esté suave. Vuelve a la sartén, agrega la nata y el pollo cocido. Cocina a fuego lento 10 minutos. Decora con cilantro. Sirve con arroz basmati y naan.',
  true
),

(
  'Chicken Caesar Salad',
  'Ensalada César con Pollo',
  'Classic Caesar salad with grilled chicken, house-made dressing, and crispy croutons.',
  'Ensalada César clásica con pollo a la plancha, aderezo casero y crutones crujientes.',
  'chicken', 'chicken', 30, 4,
  ARRAY['classic', 'salad', 'quick', 'lunch'],
  '[{"name_en":"chicken breasts","name_es":"pechugas de pollo","quantity":"2","unit":"piece"},{"name_en":"romaine lettuce","name_es":"lechuga romana","quantity":"2","unit":"piece"},{"name_en":"parmesan","name_es":"parmesano","quantity":"0.5","unit":"cup"},{"name_en":"croutons","name_es":"crutones","quantity":"1","unit":"cup"},{"name_en":"mayonnaise","name_es":"mayonesa","quantity":"0.25","unit":"cup"},{"name_en":"lemon juice","name_es":"jugo de limón","quantity":"2","unit":"tbsp"},{"name_en":"Dijon mustard","name_es":"mostaza Dijon","quantity":"1","unit":"tsp"},{"name_en":"garlic","name_es":"ajo","quantity":"2","unit":"piece"},{"name_en":"Worcestershire sauce","name_es":"salsa Worcestershire","quantity":"1","unit":"tsp"},{"name_en":"anchovy paste","name_es":"pasta de anchoa","quantity":"1","unit":"tsp"}]',
  'Season chicken breasts with salt, pepper, and olive oil. Grill or pan-sear over medium-high heat, 6-7 minutes per side until cooked through. Rest and slice. Make dressing: whisk together mayonnaise, lemon juice, Dijon, minced garlic, Worcestershire, anchovy paste, salt, and pepper. Chop romaine into bite-sized pieces. Toss lettuce with dressing and half the parmesan. Top with sliced chicken, croutons, and remaining parmesan.',
  'Sazona las pechugas de pollo con sal, pimienta y aceite de oliva. Asa a la plancha o en sartén a fuego medio-alto, 6-7 minutos por lado hasta que estén cocidas. Deja reposar y corta en lonchas. Prepara el aderezo: bate la mayonesa, el jugo de limón, la mostaza Dijon, el ajo picado, la salsa Worcestershire, la pasta de anchoa, sal y pimienta. Corta la lechuga romana en trozos del tamaño de un bocado. Mezcla la lechuga con el aderezo y la mitad del parmesano. Coloca el pollo en lonchas, los crutones y el parmesano restante encima.',
  true
),

(
  'Chicken Stir Fry with Cashews',
  'Salteado de Pollo con Anacardos',
  'Classic Chinese-inspired chicken stir fry with vegetables and crunchy cashews.',
  'Salteado de pollo clásico de inspiración china con verduras y anacardos crujientes.',
  'chicken', 'chicken', 25, 4,
  ARRAY['asian', 'quick', 'nutty', 'weeknight'],
  '[{"name_en":"chicken breast","name_es":"pechuga de pollo","quantity":"500","unit":"g"},{"name_en":"cashews","name_es":"anacardos","quantity":"0.75","unit":"cup"},{"name_en":"bell peppers","name_es":"pimientos","quantity":"2","unit":"piece"},{"name_en":"snap peas","name_es":"guisantes mollar","quantity":"150","unit":"g"},{"name_en":"green onions","name_es":"cebolleta","quantity":"3","unit":"piece"},{"name_en":"garlic","name_es":"ajo","quantity":"3","unit":"piece"},{"name_en":"soy sauce","name_es":"salsa de soja","quantity":"3","unit":"tbsp"},{"name_en":"hoisin sauce","name_es":"salsa hoisin","quantity":"2","unit":"tbsp"},{"name_en":"rice vinegar","name_es":"vinagre de arroz","quantity":"1","unit":"tbsp"},{"name_en":"sesame oil","name_es":"aceite de sésamo","quantity":"1","unit":"tbsp"},{"name_en":"cornstarch","name_es":"maicena","quantity":"1","unit":"tbsp"}]',
  'Cut chicken into 1-inch pieces. Toss with cornstarch, salt, and pepper. Mix soy sauce, hoisin, rice vinegar, and sesame oil for the sauce. Heat oil in wok over high heat. Cook chicken until golden, 4-5 minutes. Remove. Stir fry garlic 30 seconds, add peppers and snap peas, cook 3 minutes. Return chicken, add sauce, toss to coat. Add cashews and green onions, stir fry 1 minute more. Serve over steamed rice.',
  'Corta el pollo en trozos de 2.5 cm. Mezcla con maicena, sal y pimienta. Combina la salsa de soja, hoisin, vinagre de arroz y aceite de sésamo para la salsa. Calienta el aceite en un wok a fuego alto. Cocina el pollo hasta que esté dorado, 4-5 minutos. Retira. Saltea el ajo 30 segundos, agrega los pimientos y los guisantes, cocina 3 minutos. Devuelve el pollo, agrega la salsa, mezcla para cubrir. Agrega los anacardos y la cebolleta, saltea 1 minuto más. Sirve sobre arroz al vapor.',
  true
),

(
  'Mediterranean Baked Chicken Thighs',
  'Muslos de Pollo al Horno Mediterráneo',
  'Juicy chicken thighs baked with olives, sun-dried tomatoes, capers, and herbs.',
  'Jugosos muslos de pollo al horno con aceitunas, tomates secos, alcaparras y hierbas.',
  'chicken', 'chicken', 50, 4,
  ARRAY['mediterranean', 'easy', 'one-pan', 'healthy'],
  '[{"name_en":"chicken thighs bone-in","name_es":"muslos de pollo con hueso","quantity":"8","unit":"piece"},{"name_en":"kalamata olives","name_es":"aceitunas kalamata","quantity":"0.5","unit":"cup"},{"name_en":"sun-dried tomatoes","name_es":"tomates secos","quantity":"0.25","unit":"cup"},{"name_en":"capers","name_es":"alcaparras","quantity":"2","unit":"tbsp"},{"name_en":"garlic","name_es":"ajo","quantity":"6","unit":"piece"},{"name_en":"lemon","name_es":"limón","quantity":"1","unit":"piece"},{"name_en":"dried oregano","name_es":"orégano seco","quantity":"2","unit":"tsp"},{"name_en":"olive oil","name_es":"aceite de oliva","quantity":"3","unit":"tbsp"},{"name_en":"fresh thyme","name_es":"tomillo fresco","quantity":"2","unit":"tbsp"},{"name_en":"salt and pepper","name_es":"sal y pimienta","quantity":"","unit":""}]',
  'Preheat oven to 400°F (200°C). Season chicken thighs with salt, pepper, and oregano. Heat oil in oven-safe pan over high heat. Sear chicken skin-side down for 5 minutes until golden and crispy. Flip. Add garlic cloves, olives, sun-dried tomatoes, capers, lemon slices, and thyme around chicken. Transfer to oven and bake 30-35 minutes until cooked through. Spoon pan juices over chicken before serving.',
  'Precalienta el horno a 200°C. Sazona los muslos de pollo con sal, pimienta y orégano. Calienta el aceite en una sartén apta para horno a fuego alto. Sella el pollo con la piel hacia abajo durante 5 minutos hasta que esté dorado y crujiente. Voltea. Agrega los dientes de ajo, las aceitunas, los tomates secos, las alcaparras, las rodajas de limón y el tomillo alrededor del pollo. Pasa al horno y hornea 30-35 minutos hasta que esté completamente cocido. Vierte los jugos de la sartén sobre el pollo antes de servir.',
  true
),

(
  'Chicken Soup',
  'Sopa de Pollo',
  'Classic homemade chicken soup with vegetables — the ultimate comfort food.',
  'Sopa de pollo casera clásica con verduras — el máximo alimento reconfortante.',
  'chicken', 'chicken', 70, 6,
  ARRAY['comfort', 'healthy', 'classic', 'family'],
  '[{"name_en":"whole chicken","name_es":"pollo entero","quantity":"1","unit":"piece"},{"name_en":"onion","name_es":"cebolla","quantity":"1","unit":"piece"},{"name_en":"carrots","name_es":"zanahorias","quantity":"3","unit":"piece"},{"name_en":"celery","name_es":"apio","quantity":"3","unit":"piece"},{"name_en":"garlic","name_es":"ajo","quantity":"4","unit":"piece"},{"name_en":"bay leaves","name_es":"hojas de laurel","quantity":"2","unit":"piece"},{"name_en":"fresh parsley","name_es":"perejil fresco","quantity":"0.25","unit":"cup"},{"name_en":"egg noodles or rice","name_es":"fideos o arroz","quantity":"2","unit":"cup"},{"name_en":"salt and pepper","name_es":"sal y pimienta","quantity":"","unit":""},{"name_en":"fresh thyme","name_es":"tomillo fresco","quantity":"3","unit":"tbsp"}]',
  'Place whole chicken in a large pot. Cover with cold water. Add halved onion, 2 carrots, 2 celery stalks, garlic, bay leaves, and thyme. Bring to boil, skim foam. Reduce heat and simmer 45-50 minutes. Remove chicken and let cool. Strain broth and discard vegetables. Shred chicken meat. Return broth to pot with diced remaining carrots and celery. Simmer 10 minutes. Add noodles or rice and cook per package directions. Return shredded chicken. Season with salt and pepper. Serve with fresh parsley.',
  'Coloca el pollo entero en una olla grande. Cubre con agua fría. Agrega la cebolla partida por la mitad, 2 zanahorias, 2 tallos de apio, el ajo, las hojas de laurel y el tomillo. Lleva a ebullición y quita la espuma. Reduce el fuego y cocina a fuego lento 45-50 minutos. Retira el pollo y deja enfriar. Cuela el caldo y desecha las verduras. Deshebra la carne del pollo. Devuelve el caldo a la olla con las zanahorias y el apio restantes picados. Cocina a fuego lento 10 minutos. Agrega los fideos o el arroz y cocina según las instrucciones. Devuelve el pollo deshebrado. Sazona con sal y pimienta. Sirve con perejil fresco.',
  true
),

(
  'Teriyaki Chicken Bowls',
  'Bowls de Pollo Teriyaki',
  'Japanese-style teriyaki chicken served over steamed rice with sesame seeds and green onions.',
  'Pollo teriyaki estilo japonés servido sobre arroz al vapor con semillas de sésamo y cebolleta.',
  'chicken', 'chicken', 30, 4,
  ARRAY['japanese', 'quick', 'bowl', 'family-friendly'],
  '[{"name_en":"chicken thighs boneless","name_es":"muslos de pollo sin hueso","quantity":"600","unit":"g"},{"name_en":"soy sauce","name_es":"salsa de soja","quantity":"0.25","unit":"cup"},{"name_en":"mirin","name_es":"mirin","quantity":"3","unit":"tbsp"},{"name_en":"sake or dry sherry","name_es":"sake o jerez seco","quantity":"2","unit":"tbsp"},{"name_en":"sugar","name_es":"azúcar","quantity":"2","unit":"tbsp"},{"name_en":"steamed rice","name_es":"arroz al vapor","quantity":"2","unit":"cup"},{"name_en":"sesame seeds","name_es":"semillas de sésamo","quantity":"1","unit":"tbsp"},{"name_en":"green onions","name_es":"cebolleta","quantity":"2","unit":"piece"},{"name_en":"broccoli","name_es":"brócoli","quantity":"200","unit":"g"},{"name_en":"vegetable oil","name_es":"aceite vegetal","quantity":"1","unit":"tbsp"}]',
  'Mix soy sauce, mirin, sake, and sugar in a bowl. Coat chicken thighs and marinate 20 minutes. Heat oil in a pan over medium-high heat. Cook chicken skin-side down 5 minutes, flip and cook 4 more minutes. Pour remaining marinade into pan and cook until it glazes the chicken, about 2 minutes. Slice chicken and serve over rice with steamed broccoli. Drizzle with pan sauce and garnish with sesame seeds and green onions.',
  'Mezcla la salsa de soja, el mirin, el sake y el azúcar en un bol. Cubre los muslos de pollo y marina 20 minutos. Calienta el aceite en una sartén a fuego medio-alto. Cocina el pollo con la piel hacia abajo 5 minutos, voltea y cocina 4 minutos más. Vierte el marinado restante en la sartén y cocina hasta que glasee el pollo, unos 2 minutos. Corta el pollo en lonchas y sirve sobre arroz con brócoli al vapor. Rocía con la salsa de la sartén y decora con semillas de sésamo y cebolleta.',
  true
),

(
  'Chicken Fajitas',
  'Fajitas de Pollo',
  'Sizzling chicken fajitas with colorful peppers and onions, served with warm tortillas.',
  'Fajitas de pollo chisporroteantes con pimientos coloridos y cebolla, servidas con tortillas calientes.',
  'chicken', 'chicken', 30, 4,
  ARRAY['mexican', 'quick', 'sizzling', 'family'],
  '[{"name_en":"chicken breasts","name_es":"pechugas de pollo","quantity":"500","unit":"g"},{"name_en":"mixed bell peppers","name_es":"pimientos mixtos","quantity":"3","unit":"piece"},{"name_en":"onion","name_es":"cebolla","quantity":"1","unit":"piece"},{"name_en":"lime","name_es":"lima","quantity":"2","unit":"piece"},{"name_en":"cumin","name_es":"comino","quantity":"1","unit":"tsp"},{"name_en":"chili powder","name_es":"chile en polvo","quantity":"1","unit":"tsp"},{"name_en":"smoked paprika","name_es":"pimentón ahumado","quantity":"1","unit":"tsp"},{"name_en":"flour tortillas","name_es":"tortillas de harina","quantity":"8","unit":"piece"},{"name_en":"sour cream","name_es":"crema agria","quantity":"0.5","unit":"cup"},{"name_en":"guacamole","name_es":"guacamole","quantity":"1","unit":"cup"},{"name_en":"olive oil","name_es":"aceite de oliva","quantity":"3","unit":"tbsp"}]',
  'Slice chicken into strips. Season with cumin, chili powder, paprika, salt, pepper, and lime juice. Let marinate 15 minutes. Slice peppers and onions into strips. Heat oil in a large cast iron pan over high heat until smoking. Cook chicken strips in a single layer 3-4 minutes until charred. Remove. Cook peppers and onions in same pan until slightly charred, 4-5 minutes. Return chicken and toss together. Serve immediately in warm tortillas with sour cream and guacamole.',
  'Corta el pollo en tiras. Sazona con comino, chile en polvo, pimentón, sal, pimienta y jugo de lima. Marina 15 minutos. Corta los pimientos y la cebolla en tiras. Calienta el aceite en una sartén de hierro grande a fuego alto hasta que humee. Cocina las tiras de pollo en una sola capa 3-4 minutos hasta que estén tostadas. Retira. Cocina los pimientos y la cebolla en la misma sartén hasta que estén ligeramente tostados, 4-5 minutos. Devuelve el pollo y mezcla todo. Sirve inmediatamente en tortillas calientes con crema agria y guacamole.',
  true
),

-- PROTEIN/OTHER (5 more)
(
  'Baked Salmon with Lemon Dill',
  'Salmón al Horno con Limón y Eneldo',
  'Perfectly baked salmon fillets with a bright lemon dill crust.',
  'Filetes de salmón perfectamente horneados con una corteza brillante de limón y eneldo.',
  'seafood', 'salmon', 25, 4,
  ARRAY['healthy', 'omega-3', 'quick', 'gluten-free'],
  '[{"name_en":"salmon fillets","name_es":"filetes de salmón","quantity":"4","unit":"piece"},{"name_en":"lemon","name_es":"limón","quantity":"2","unit":"piece"},{"name_en":"fresh dill","name_es":"eneldo fresco","quantity":"3","unit":"tbsp"},{"name_en":"garlic","name_es":"ajo","quantity":"2","unit":"piece"},{"name_en":"olive oil","name_es":"aceite de oliva","quantity":"2","unit":"tbsp"},{"name_en":"Dijon mustard","name_es":"mostaza Dijon","quantity":"1","unit":"tbsp"},{"name_en":"honey","name_es":"miel","quantity":"1","unit":"tbsp"},{"name_en":"salt and pepper","name_es":"sal y pimienta","quantity":"","unit":""}]',
  'Preheat oven to 400°F (200°C). Line a baking sheet with parchment. Pat salmon dry. Mix olive oil, lemon juice, lemon zest, minced garlic, Dijon mustard, honey, chopped dill, salt, and pepper. Place salmon skin-side down on prepared baking sheet. Spoon glaze over each fillet. Bake 12-15 minutes until salmon flakes easily with a fork. Serve with lemon slices and extra dill.',
  'Precalienta el horno a 200°C. Forra una bandeja de horno con papel de cocina. Seca el salmón. Mezcla el aceite de oliva, el jugo de limón, la ralladura de limón, el ajo picado, la mostaza Dijon, la miel, el eneldo picado, la sal y la pimienta. Coloca el salmón con la piel hacia abajo en la bandeja preparada. Unta el glaseado sobre cada filete. Hornea 12-15 minutos hasta que el salmón se deshaga fácilmente con un tenedor. Sirve con rodajas de limón y eneldo extra.',
  true
),

(
  'Shrimp Scampi',
  'Camarones al Ajillo',
  'Classic buttery shrimp scampi with garlic, white wine, and fresh parsley.',
  'Camarones al ajillo clásicos con mantequilla, vino blanco y perejil fresco.',
  'seafood', 'shrimp', 20, 4,
  ARRAY['italian', 'quick', 'seafood', 'elegant'],
  '[{"name_en":"large shrimp peeled","name_es":"gambones pelados","quantity":"500","unit":"g"},{"name_en":"garlic cloves","name_es":"dientes de ajo","quantity":"6","unit":"piece"},{"name_en":"white wine","name_es":"vino blanco","quantity":"0.5","unit":"cup"},{"name_en":"butter","name_es":"mantequilla","quantity":"4","unit":"tbsp"},{"name_en":"olive oil","name_es":"aceite de oliva","quantity":"2","unit":"tbsp"},{"name_en":"lemon","name_es":"limón","quantity":"1","unit":"piece"},{"name_en":"red pepper flakes","name_es":"hojuelas de chile","quantity":"0.25","unit":"tsp"},{"name_en":"fresh parsley","name_es":"perejil fresco","quantity":"0.25","unit":"cup"},{"name_en":"salt and pepper","name_es":"sal y pimienta","quantity":"","unit":""},{"name_en":"linguine pasta","name_es":"pasta linguine","quantity":"400","unit":"g"}]',
  'Cook pasta in salted boiling water until al dente. Reserve 1/2 cup pasta water. Pat shrimp dry and season with salt and pepper. Heat olive oil in a large skillet over medium-high heat. Add shrimp and cook 1-2 minutes per side until pink and slightly curled. Remove shrimp. In same pan, melt butter and sauté sliced garlic with red pepper flakes for 1 minute. Add white wine and lemon juice, simmer 2 minutes. Return shrimp and toss. Add drained pasta and parsley, toss to combine. Use pasta water to adjust consistency.',
  'Cocina la pasta en agua salada hirviendo hasta que esté al dente. Reserva 1/2 taza del agua de cocción. Seca los camarones y sazona con sal y pimienta. Calienta el aceite de oliva en una sartén grande a fuego medio-alto. Agrega los camarones y cocina 1-2 minutos por lado hasta que estén rosados y ligeramente enrollados. Retira los camarones. En la misma sartén, derrite la mantequilla y sofríe el ajo en láminas con las hojuelas de chile durante 1 minuto. Agrega el vino blanco y el jugo de limón, cocina a fuego lento 2 minutos. Devuelve los camarones y mezcla. Agrega la pasta escurrida y el perejil, mezcla para combinar. Usa el agua de cocción para ajustar la consistencia.',
  true
),

(
  'Vegetable Frittata',
  'Frittata de Verduras',
  'Italian-style baked egg frittata loaded with seasonal vegetables and cheese.',
  'Frittata de huevos al horno estilo italiano llena de verduras de temporada y queso.',
  'veggies', NULL, 30, 4,
  ARRAY['vegetarian', 'italian', 'protein', 'brunch', 'gluten-free'],
  '[{"name_en":"eggs","name_es":"huevos","quantity":"8","unit":"piece"},{"name_en":"milk","name_es":"leche","quantity":"0.25","unit":"cup"},{"name_en":"spinach","name_es":"espinacas","quantity":"2","unit":"cup"},{"name_en":"cherry tomatoes","name_es":"tomates cherry","quantity":"1","unit":"cup"},{"name_en":"bell pepper","name_es":"pimiento","quantity":"1","unit":"piece"},{"name_en":"onion","name_es":"cebolla","quantity":"0.5","unit":"piece"},{"name_en":"feta cheese","name_es":"queso feta","quantity":"0.5","unit":"cup"},{"name_en":"parmesan","name_es":"parmesano","quantity":"0.25","unit":"cup"},{"name_en":"olive oil","name_es":"aceite de oliva","quantity":"2","unit":"tbsp"},{"name_en":"fresh basil","name_es":"albahaca fresca","quantity":"0.25","unit":"cup"},{"name_en":"salt and pepper","name_es":"sal y pimienta","quantity":"","unit":""}]',
  'Preheat oven to 375°F (190°C). Whisk eggs with milk, salt, and pepper. Heat oil in a 10-inch oven-safe skillet over medium heat. Sauté onion and pepper until soft, 4 minutes. Add spinach and cook until wilted. Pour egg mixture over vegetables. Scatter cherry tomatoes and feta on top. Cook on stovetop until edges set, 3-4 minutes. Transfer to oven and bake 15-18 minutes until center is just set. Let cool slightly, garnish with basil and parmesan.',
  'Precalienta el horno a 190°C. Bate los huevos con la leche, la sal y la pimienta. Calienta el aceite en una sartén de 25 cm apta para horno a fuego medio. Sofríe la cebolla y el pimiento hasta que estén blandos, 4 minutos. Agrega las espinacas y cocina hasta que se reduzcan. Vierte la mezcla de huevos sobre las verduras. Dispersa los tomates cherry y el feta encima. Cocina en el fogón hasta que los bordes cuajen, 3-4 minutos. Pasa al horno y hornea 15-18 minutos hasta que el centro esté justo cuajado. Deja enfriar un poco, decora con albahaca y parmesano.',
  true
),

(
  'Lentil Soup',
  'Sopa de Lentejas',
  'Hearty and warming red lentil soup with cumin, turmeric, and lemon.',
  'Reconfortante sopa de lentejas rojas con comino, cúrcuma y limón.',
  'soups', NULL, 40, 6,
  ARRAY['vegan', 'gluten-free', 'healthy', 'make-ahead', 'budget'],
  '[{"name_en":"red lentils","name_es":"lentejas rojas","quantity":"2","unit":"cup"},{"name_en":"onion","name_es":"cebolla","quantity":"1","unit":"piece"},{"name_en":"garlic","name_es":"ajo","quantity":"4","unit":"piece"},{"name_en":"carrots","name_es":"zanahorias","quantity":"2","unit":"piece"},{"name_en":"celery","name_es":"apio","quantity":"2","unit":"piece"},{"name_en":"crushed tomatoes","name_es":"tomates triturados","quantity":"400","unit":"g"},{"name_en":"vegetable broth","name_es":"caldo de verduras","quantity":"1","unit":"L"},{"name_en":"cumin","name_es":"comino","quantity":"2","unit":"tsp"},{"name_en":"turmeric","name_es":"cúrcuma","quantity":"1","unit":"tsp"},{"name_en":"lemon","name_es":"limón","quantity":"1","unit":"piece"},{"name_en":"olive oil","name_es":"aceite de oliva","quantity":"3","unit":"tbsp"},{"name_en":"fresh cilantro","name_es":"cilantro fresco","quantity":"0.25","unit":"cup"}]',
  'Heat olive oil in a large pot over medium heat. Sauté diced onion, carrots, and celery until soft, about 8 minutes. Add garlic, cumin, and turmeric, cook 1 minute. Add lentils, crushed tomatoes, and vegetable broth. Bring to boil, reduce heat, and simmer 25 minutes until lentils are very soft. Use an immersion blender to partially blend for a creamy texture with some chunks. Add lemon juice and zest. Season with salt and pepper. Serve with fresh cilantro and a drizzle of olive oil.',
  'Calienta el aceite de oliva en una olla grande a fuego medio. Sofríe la cebolla picada, las zanahorias y el apio hasta que estén blandos, unos 8 minutos. Agrega el ajo, el comino y la cúrcuma, cocina 1 minuto. Agrega las lentejas, los tomates triturados y el caldo de verduras. Lleva a ebullición, reduce el fuego y cocina a fuego lento 25 minutos hasta que las lentejas estén muy tiernas. Usa una batidora de mano para mezclar parcialmente para una textura cremosa con algunos trozos. Agrega el jugo y la ralladura de limón. Sazona con sal y pimienta. Sirve con cilantro fresco y un chorrito de aceite de oliva.',
  true
),

(
  'Greek Salad with Feta',
  'Ensalada Griega con Feta',
  'Fresh and vibrant Greek salad with cucumber, tomatoes, olives, and creamy feta.',
  'Ensalada griega fresca y vibrante con pepino, tomates, aceitunas y feta cremoso.',
  'salads', NULL, 15, 4,
  ARRAY['greek', 'vegan-without-feta', 'no-cook', 'healthy', 'quick'],
  '[{"name_en":"cucumber","name_es":"pepino","quantity":"1","unit":"piece"},{"name_en":"cherry tomatoes","name_es":"tomates cherry","quantity":"2","unit":"cup"},{"name_en":"red bell pepper","name_es":"pimiento rojo","quantity":"1","unit":"piece"},{"name_en":"red onion","name_es":"cebolla roja","quantity":"0.5","unit":"piece"},{"name_en":"kalamata olives","name_es":"aceitunas kalamata","quantity":"0.5","unit":"cup"},{"name_en":"feta cheese","name_es":"queso feta","quantity":"200","unit":"g"},{"name_en":"olive oil","name_es":"aceite de oliva","quantity":"3","unit":"tbsp"},{"name_en":"red wine vinegar","name_es":"vinagre de vino tinto","quantity":"1","unit":"tbsp"},{"name_en":"dried oregano","name_es":"orégano seco","quantity":"1","unit":"tsp"},{"name_en":"salt and pepper","name_es":"sal y pimienta","quantity":"","unit":""}]',
  'Chop cucumber into half-moons. Halve cherry tomatoes. Slice red pepper and thinly slice red onion. Combine vegetables and olives in a large bowl. Whisk together olive oil, red wine vinegar, oregano, salt, and pepper. Pour dressing over salad and toss gently. Top with crumbled or sliced feta. Do not overdress. Serve immediately or let sit 10 minutes for flavors to develop.',
  'Corta el pepino en medias lunas. Parte los tomates cherry por la mitad. Corta el pimiento rojo en tiras y la cebolla roja en rodajas finas. Combina las verduras y las aceitunas en un bol grande. Bate el aceite de oliva, el vinagre de vino tinto, el orégano, la sal y la pimienta. Vierte el aderezo sobre la ensalada y mezcla suavemente. Coloca el feta desmenuzado o en lonchas encima. No te excedas con el aderezo. Sirve inmediatamente o deja reposar 10 minutos para que los sabores se integren.',
  true
);

-- ============================================
-- COOKING RULES (10)
-- ============================================

INSERT INTO cooking_rules (rule_type, rule_definition, is_active) VALUES

('dietary', '{"description": "No dairy products", "reason": "Lactose intolerance", "restrictions": ["milk", "cheese", "butter", "cream", "yogurt"], "alternatives": ["plant-based milk", "vegan butter", "coconut cream"]}', true),

('allergy', '{"description": "Severe nut allergy — NO nuts of any kind", "severity": "severe", "allergens": ["peanuts", "tree nuts", "almonds", "walnuts", "cashews", "pecans", "hazelnuts", "pistachios"], "note": "Cross-contamination is also a concern — use separate utensils and surfaces"}', true),

('preference', '{"description": "Prefer lean proteins — chicken breast or fish over fatty cuts", "note": "Avoid skin-on chicken, fatty beef cuts, and pork belly. Ground beef should be 90/10 or leaner"}', true),

('preference', '{"description": "No raw onion in dishes — cooked onion is fine", "details": "Raw onion in salads or garnishes must be avoided. Caramelized or sautéed onion is acceptable"}', true),

('technique', '{"description": "Always use fresh herbs when possible — dried herbs as a last resort", "ratio": "Use 3x the amount of fresh herbs vs dried", "preferred": ["basil", "parsley", "cilantro", "chives", "dill", "thyme", "rosemary"]}', true),

('timing', '{"description": "Meals must be ready by 2:00 PM on visit days", "prep_window": "cooking starts at 10:00 AM", "service": "food should be hot and plated by 1:45 PM", "note": "Prepare cold dishes and desserts first"}', true),

('dietary', '{"description": "Low sodium — reduce added salt in all dishes", "max_salt_per_serving_mg": 500, "avoid": ["soy sauce in large quantities", "processed foods", "canned goods with high sodium"], "alternatives": ["lemon juice for acidity", "herbs for flavor", "low-sodium soy sauce"]}', true),

('technique', '{"description": "Always marinate proteins for minimum 30 minutes", "minimum_time": "30 minutes", "preferred_time": "overnight", "note": "For fish, do not marinate more than 30 minutes as acid will denature proteins"}', false),

('preference', '{"description": "Spice level: mild to medium only", "max_heat": "medium", "avoid": ["ghost peppers", "scotch bonnets", "excessive chili flakes"], "acceptable": ["jalapeño with seeds removed", "mild paprika", "cumin", "light chili powder"]}', true),

('dietary', '{"description": "Gluten-free options preferred when possible", "restrictions": ["wheat", "barley", "rye", "regular pasta", "regular bread"], "allowed": ["rice", "quinoa", "gluten-free pasta", "corn tortillas", "potatoes"], "note": "Cross-contamination: use dedicated gluten-free utensils and pans"}', false);

-- ============================================
-- FRIDGE STAPLES
-- ============================================

INSERT INTO fridge_staples (item_name_en, item_name_es, quantity, category, notes_en, notes_es, is_active) VALUES

-- Oils & Vinegars
('Extra virgin olive oil', 'Aceite de oliva virgen extra', '1 bottle', 'oils', 'Always in pantry — use for cooking and dressings', 'Siempre en la despensa — usar para cocinar y aderezos', true),
('Sesame oil', 'Aceite de sésamo', '1 bottle', 'oils', 'For Asian dishes and stir fries', 'Para platos asiáticos y salteados', true),
('Vegetable oil', 'Aceite vegetal', '1 bottle', 'oils', 'For high-heat cooking', 'Para cocinar a alta temperatura', true),
('Red wine vinegar', 'Vinagre de vino tinto', '1 bottle', 'condiments', 'For dressings and chimichurri', 'Para aderezos y chimichurri', true),
('Apple cider vinegar', 'Vinagre de manzana', '1 bottle', 'condiments', NULL, NULL, true),
('Balsamic vinegar', 'Vinagre balsámico', '1 bottle', 'condiments', NULL, NULL, true),

-- Condiments
('Soy sauce', 'Salsa de soja', '1 bottle', 'condiments', 'Standard and low-sodium versions', 'Versión estándar y baja en sodio', true),
('Dijon mustard', 'Mostaza Dijon', '1 jar', 'condiments', NULL, NULL, true),
('Honey', 'Miel', '1 jar', 'condiments', NULL, NULL, true),
('Worcestershire sauce', 'Salsa Worcestershire', '1 bottle', 'condiments', NULL, NULL, true),
('Hot sauce', 'Salsa picante', '1 bottle', 'condiments', 'Tabasco or Cholula', 'Tabasco o Cholula', true),
('Hoisin sauce', 'Salsa hoisin', '1 bottle', 'condiments', NULL, NULL, true),
('Oyster sauce', 'Salsa de ostras', '1 bottle', 'condiments', NULL, NULL, true),
('Maple syrup', 'Jarabe de arce', '1 bottle', 'condiments', NULL, NULL, true),

-- Dairy & Eggs
('Eggs', 'Huevos', '12 pack', 'dairy', 'Free-range preferred', 'Preferiblemente de corral', true),
('Butter unsalted', 'Mantequilla sin sal', '250g', 'dairy', NULL, NULL, true),
('Heavy cream', 'Nata para cocinar', '500ml', 'dairy', NULL, NULL, true),
('Parmesan block', 'Bloque de parmesano', '200g', 'dairy', 'Freshly grate — avoid pre-grated', 'Rallar fresco — evitar pre-rallado', true),
('Cream cheese', 'Queso crema', '200g', 'dairy', NULL, NULL, true),
('Greek yogurt', 'Yogur griego', '500g', 'dairy', 'Plain, full-fat', 'Natural, entero', true),

-- Aromatics
('Garlic', 'Ajo', '2 bulbs', 'aromatics', 'Always have at least 2 heads', 'Tener siempre al menos 2 cabezas', true),
('Onions', 'Cebollas', '4 pieces', 'aromatics', 'Yellow and red onions', 'Cebollas amarillas y rojas', true),
('Shallots', 'Chalotas', '4 pieces', 'aromatics', NULL, NULL, true),
('Ginger root', 'Jengibre fresco', '1 piece', 'aromatics', 'Keep wrapped in fridge or freeze', 'Guardar envuelto en nevera o congelar', true),
('Lemon', 'Limón', '4 pieces', 'aromatics', 'Always have fresh lemons', 'Tener siempre limones frescos', true),
('Lime', 'Lima', '4 pieces', 'aromatics', NULL, NULL, true),

-- Herbs
('Fresh parsley', 'Perejil fresco', '1 bunch', 'herbs', NULL, NULL, true),
('Fresh cilantro', 'Cilantro fresco', '1 bunch', 'herbs', NULL, NULL, true),
('Fresh basil', 'Albahaca fresca', '1 pot', 'herbs', NULL, NULL, true),
('Fresh thyme', 'Tomillo fresco', '1 bunch', 'herbs', NULL, NULL, true),
('Fresh rosemary', 'Romero fresco', '1 bunch', 'herbs', NULL, NULL, true),
('Fresh chives', 'Cebollino fresco', '1 bunch', 'herbs', NULL, NULL, true),

-- Dry Goods
('Basmati rice', 'Arroz basmati', '1 bag', 'grains', NULL, NULL, true),
('Quinoa', 'Quinoa', '500g', 'grains', NULL, NULL, true),
('Pasta penne', 'Pasta penne', '500g', 'grains', NULL, NULL, true),
('Pasta linguine', 'Pasta linguine', '500g', 'grains', NULL, NULL, true),
('Breadcrumbs', 'Pan rallado', '200g', 'grains', 'Panko and regular', 'Panko y regular', true),
('Flour', 'Harina', '500g', 'grains', 'All-purpose', 'Todo uso', true),
('Cornstarch', 'Maicena', '200g', 'grains', NULL, NULL, true),

-- Spices
('Salt', 'Sal', '500g', 'spices', 'Sea salt and kosher salt', 'Sal marina y kosher', true),
('Black pepper', 'Pimienta negra', '100g', 'spices', 'Whole peppercorns and ground', 'En grano y molida', true),
('Cumin', 'Comino', '50g', 'spices', NULL, NULL, true),
('Paprika smoked', 'Pimentón ahumado', '50g', 'spices', NULL, NULL, true),
('Cinnamon', 'Canela', '50g', 'spices', 'Ground and sticks', 'Molida y en rama', true),
('Turmeric', 'Cúrcuma', '50g', 'spices', NULL, NULL, true),
('Oregano dried', 'Orégano seco', '30g', 'spices', NULL, NULL, true),
('Chili flakes', 'Hojuelas de chile', '30g', 'spices', NULL, NULL, true),
('Garam masala', 'Garam masala', '50g', 'spices', NULL, NULL, true),
('Bay leaves', 'Hojas de laurel', '20g', 'spices', NULL, NULL, true),
('Cayenne', 'Cayena', '30g', 'spices', NULL, NULL, true),
('Garlic powder', 'Ajo en polvo', '50g', 'spices', NULL, NULL, true),

-- Canned/Jarred
('Crushed tomatoes', 'Tomates triturados', '4 cans', 'canned', '400g cans', 'Latas de 400g', true),
('Chicken broth', 'Caldo de pollo', '2 cartons', 'canned', 'Low-sodium preferred', 'Preferiblemente bajo en sodio', true),
('Vegetable broth', 'Caldo de verduras', '2 cartons', 'canned', NULL, NULL, true),
('Kalamata olives', 'Aceitunas kalamata', '1 jar', 'canned', 'Pitted preferred', 'Preferiblemente sin hueso', true),
('Capers', 'Alcaparras', '1 jar', 'canned', NULL, NULL, true),
('Sun-dried tomatoes', 'Tomates secos', '1 jar', 'canned', 'In olive oil', 'En aceite de oliva', true),
('Coconut cream', 'Crema de coco', '2 cans', 'canned', NULL, NULL, true);
