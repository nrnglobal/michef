-- ============================================
-- Casa Cook - Seed Data
-- Migration 002: Recipes, Rules, Fridge Staples
-- All 32 recipes from the spec + 10 rules + fridge staples
-- ============================================

-- ============================================
-- RECIPES (32 recipes matching the spec)
-- ============================================

INSERT INTO recipes (title_en, title_es, description_en, description_es, category, protein_type, prep_time_minutes, servings, tags, ingredients, instructions_en, instructions_es, is_active) VALUES

-- ============================================
-- SNACKS & SIDES (8 recipes)
-- ============================================

(
  'Energy Balls',
  'Bolitas de Energía',
  'No-bake oat and almond butter energy balls with dates and dark chocolate — batch-friendly and freezer-safe.',
  'Bolitas de avena y mantequilla de almendra sin horno con dátiles y chocolate oscuro — ideales para hacer en cantidad y congelar.',
  'snacks', NULL, 20, 12,
  ARRAY['no-bake', 'batch-cook', 'freezer-friendly', 'gluten-free', 'healthy', 'no-added-sugar'],
  '[{"name_en":"rolled oats","name_es":"avena en hojuelas","quantity":"2","unit":"cups"},{"name_en":"natural almond butter","name_es":"mantequilla de almendra natural","quantity":"0.5","unit":"cup"},{"name_en":"Medjool dates (pitted)","name_es":"dátiles Medjool (sin hueso)","quantity":"10","unit":"piece"},{"name_en":"dark chocolate chips (70%+)","name_es":"chispas de chocolate oscuro (70%+)","quantity":"0.5","unit":"cup"},{"name_en":"chia seeds","name_es":"semillas de chía","quantity":"2","unit":"tbsp"},{"name_en":"vanilla extract","name_es":"extracto de vainilla","quantity":"1","unit":"tsp"},{"name_en":"sea salt","name_es":"sal marina","quantity":"0.25","unit":"tsp"}]',
  'Soak dates in warm water 5 minutes, drain and blend into a paste. In a large bowl, combine oats, almond butter, date paste, chocolate chips, chia seeds, vanilla, and salt. Mix until a sticky dough forms — add 1 tbsp water if too dry. Roll into 2-tbsp balls. Refrigerate 30 minutes to set. Store in fridge up to 2 weeks or freeze up to 3 months.',
  'Remoja los dátiles en agua tibia 5 minutos, escurre y licúa hasta hacer una pasta. En un bol grande, combina la avena, la mantequilla de almendra, la pasta de dátiles, las chispas de chocolate, las semillas de chía, la vainilla y la sal. Mezcla hasta obtener una masa pegajosa — agrega 1 cucharada de agua si está muy seca. Forma bolitas con 2 cucharadas. Refrigera 30 minutos. Guarda en el refrigerador hasta 2 semanas o congela hasta 3 meses.',
  true
),

(
  'Mixed Fruit Plate',
  'Plato de Frutas Variadas',
  'Seasonal tropical fruit platter — sliced and ready to serve as a fresh, colorful side.',
  'Plato de frutas tropicales de temporada — rebanadas y listas para servir como acompañamiento fresco y colorido.',
  'snacks', NULL, 15, 2,
  ARRAY['vegan', 'gluten-free', 'no-cook', 'healthy', 'quick'],
  '[{"name_en":"watermelon","name_es":"sandía","quantity":"2","unit":"cups"},{"name_en":"mango","name_es":"mango","quantity":"1","unit":"piece"},{"name_en":"pineapple","name_es":"piña","quantity":"1","unit":"cup"},{"name_en":"papaya","name_es":"papaya","quantity":"1","unit":"cup"},{"name_en":"lime","name_es":"lima","quantity":"1","unit":"piece"},{"name_en":"tajín or chili powder","name_es":"tajín o chile en polvo","quantity":"1","unit":"tsp"}]',
  'Peel and cube mango, pineapple, and papaya into bite-sized pieces. Slice watermelon into cubes or wedges. Arrange on a large platter in sections by color. Squeeze lime juice over the top. Serve tajín on the side for sprinkling.',
  'Pela y corta en cubos el mango, la piña y la papaya en trozos del tamaño de un bocado. Corta la sandía en cubos o gajos. Acomoda en un platón grande en secciones por color. Exprime jugo de lima encima. Sirve el tajín aparte para espolvorear.',
  true
),

(
  'Fried Plantains',
  'Plátanos Fritos',
  'Sweet ripe plantains pan-fried until golden and caramelized — a classic Mexican side dish.',
  'Plátanos maduros dulces fritos en sartén hasta estar dorados y caramelizados — un acompañamiento clásico mexicano.',
  'snacks', NULL, 15, 2,
  ARRAY['vegan', 'gluten-free', 'quick', 'side-dish', 'mexican'],
  '[{"name_en":"ripe plantains (yellow/black skin)","name_es":"plátanos maduros (piel amarilla/negra)","quantity":"2","unit":"piece"},{"name_en":"extra virgin olive oil","name_es":"aceite de oliva extra virgen","quantity":"2","unit":"tbsp"},{"name_en":"sea salt","name_es":"sal marina","quantity":"0.5","unit":"tsp"}]',
  'Peel plantains and slice diagonally into 1cm thick pieces. Heat olive oil in a large skillet over medium heat. Add plantain slices in a single layer. Cook 2-3 minutes per side until golden brown and caramelized. Drain on paper towels. Season with salt.',
  'Pela los plátanos y córtalos diagonalmente en rodajas de 1 cm de grosor. Calienta el aceite de oliva en una sartén grande a fuego medio. Agrega las rodajas en una sola capa. Cocina 2-3 minutos por lado hasta que estén doradas y caramelizadas. Escurre en papel absorbente. Sazona con sal.',
  true
),

(
  'Cucumber Salad',
  'Ensalada de Pepino',
  'Crisp cucumber salad with red onion, lime, and fresh herbs — light and refreshing.',
  'Ensalada de pepino crujiente con cebolla morada, lima y hierbas frescas — ligera y refrescante.',
  'snacks', NULL, 10, 2,
  ARRAY['vegan', 'gluten-free', 'quick', 'no-cook', 'healthy'],
  '[{"name_en":"cucumbers","name_es":"pepinos","quantity":"2","unit":"piece"},{"name_en":"red onion","name_es":"cebolla morada","quantity":"0.25","unit":"piece"},{"name_en":"fresh cilantro","name_es":"cilantro fresco","quantity":"3","unit":"tbsp"},{"name_en":"lime","name_es":"lima","quantity":"1","unit":"piece"},{"name_en":"extra virgin olive oil","name_es":"aceite de oliva extra virgen","quantity":"1","unit":"tbsp"},{"name_en":"sea salt","name_es":"sal marina","quantity":"0.5","unit":"tsp"},{"name_en":"tajín or chili flakes","name_es":"tajín o hojuelas de chile","quantity":"1","unit":"tsp"}]',
  'Slice cucumbers thinly. Thinly slice red onion. Roughly chop cilantro. Combine in a bowl. Squeeze lime juice over, drizzle olive oil, sprinkle salt and tajín. Toss gently and let marinate 5 minutes before serving.',
  'Rebana los pepinos finamente. Rebana la cebolla morada finamente. Pica el cilantro toscamente. Combina en un bol. Exprime jugo de lima, rocía aceite de oliva, espolvorea sal y tajín. Mezcla suavemente y deja marinar 5 minutos antes de servir.',
  true
),

(
  'Jicama Sticks',
  'Palitos de Jícama',
  'Crunchy jicama sticks seasoned with lime, chili, and salt — the perfect healthy snack.',
  'Palitos de jícama crujientes sazonados con lima, chile y sal — el snack saludable perfecto.',
  'snacks', NULL, 10, 2,
  ARRAY['vegan', 'gluten-free', 'no-cook', 'healthy', 'quick'],
  '[{"name_en":"jicama","name_es":"jícama","quantity":"0.5","unit":"piece"},{"name_en":"lime","name_es":"lima","quantity":"1","unit":"piece"},{"name_en":"tajín or chili powder","name_es":"tajín o chile en polvo","quantity":"1","unit":"tbsp"},{"name_en":"sea salt","name_es":"sal marina","quantity":"0.5","unit":"tsp"}]',
  'Peel jicama with a sharp knife. Cut into sticks approximately 1cm wide and 8cm long. Arrange on a plate. Squeeze lime juice over the sticks. Sprinkle generously with tajín and sea salt.',
  'Pela la jícama con un cuchillo filoso. Corta en palitos de 1 cm de ancho y 8 cm de largo. Acomoda en un plato. Exprime jugo de lima. Espolvorea generosamente con tajín y sal marina.',
  true
),

(
  'Mango Salad',
  'Ensalada de Mango',
  'Fresh mango salad with cucumber, red onion, and a lime-chili dressing — tropical and vibrant.',
  'Ensalada de mango fresco con pepino, cebolla morada y aderezo de lima y chile — tropical y vibrante.',
  'snacks', NULL, 15, 2,
  ARRAY['vegan', 'gluten-free', 'no-cook', 'healthy'],
  '[{"name_en":"ripe mangos","name_es":"mangos maduros","quantity":"2","unit":"piece"},{"name_en":"cucumber","name_es":"pepino","quantity":"1","unit":"piece"},{"name_en":"red onion","name_es":"cebolla morada","quantity":"0.25","unit":"piece"},{"name_en":"fresh cilantro","name_es":"cilantro fresco","quantity":"3","unit":"tbsp"},{"name_en":"jalapeño","name_es":"jalapeño","quantity":"0.5","unit":"piece"},{"name_en":"lime","name_es":"lima","quantity":"2","unit":"piece"},{"name_en":"sea salt","name_es":"sal marina","quantity":"0.5","unit":"tsp"}]',
  'Peel and cube mangos into bite-sized chunks. Dice cucumber. Finely dice red onion and jalapeño (remove seeds for less heat). Roughly chop cilantro. Combine all in a bowl. Squeeze lime juice over, season with salt, toss gently.',
  'Pela y corta los mangos en trozos del tamaño de un bocado. Pica el pepino en cubos. Pica finamente la cebolla morada y el jalapeño (quita las semillas para menos picante). Pica el cilantro toscamente. Combina todo en un bol. Exprime el jugo de lima, sazona con sal, mezcla suavemente.',
  true
),

(
  'Israeli Salad with Feta',
  'Ensalada Israelí con Feta',
  'Classic Israeli chopped salad with tomatoes, cucumber, herbs, and crumbled feta — no lettuce.',
  'Ensalada picada israelí clásica con tomates, pepino, hierbas y queso feta desmoronado — sin lechuga.',
  'snacks', NULL, 15, 2,
  ARRAY['vegetarian', 'gluten-free', 'no-cook', 'healthy', 'mediterranean'],
  '[{"name_en":"cherry tomatoes","name_es":"tomates cherry","quantity":"1.5","unit":"cups"},{"name_en":"cucumber","name_es":"pepino","quantity":"1","unit":"piece"},{"name_en":"red onion","name_es":"cebolla morada","quantity":"0.25","unit":"piece"},{"name_en":"fresh parsley","name_es":"perejil fresco","quantity":"0.25","unit":"cup"},{"name_en":"fresh mint","name_es":"menta fresca","quantity":"2","unit":"tbsp"},{"name_en":"feta cheese","name_es":"queso feta","quantity":"80","unit":"g"},{"name_en":"extra virgin olive oil","name_es":"aceite de oliva extra virgen","quantity":"2","unit":"tbsp"},{"name_en":"lemon","name_es":"limón","quantity":"1","unit":"piece"},{"name_en":"sea salt","name_es":"sal marina","quantity":"0.5","unit":"tsp"},{"name_en":"black pepper","name_es":"pimienta negra","quantity":"0.25","unit":"tsp"}]',
  'Dice tomatoes and cucumber into very small, uniform pieces (about 0.5cm). Finely dice red onion. Chop parsley and mint. Combine vegetables and herbs in a bowl. Drizzle with olive oil, squeeze lemon juice, season with salt and pepper. Toss well. Crumble feta over the top. Serve immediately.',
  'Pica los tomates y el pepino en trozos muy pequeños y uniformes (unos 0.5 cm). Pica finamente la cebolla morada. Pica el perejil y la menta. Combina las verduras y hierbas en un bol. Rocía con aceite de oliva, exprime jugo de limón, sazona con sal y pimienta. Mezcla bien. Desmorona el queso feta encima. Sirve inmediatamente.',
  true
),

(
  'Pico de Gallo',
  'Pico de Gallo',
  'Fresh Mexican tomato salsa with jalapeño, onion, cilantro, and lime — serve with totopos.',
  'Salsa mexicana fresca de tomate con jalapeño, cebolla, cilantro y lima — servir con totopos.',
  'snacks', NULL, 15, 4,
  ARRAY['vegan', 'gluten-free', 'no-cook', 'healthy', 'mexican'],
  '[{"name_en":"ripe tomatoes","name_es":"tomates maduros","quantity":"4","unit":"piece"},{"name_en":"white onion","name_es":"cebolla blanca","quantity":"0.5","unit":"piece"},{"name_en":"jalapeño","name_es":"jalapeño","quantity":"1","unit":"piece"},{"name_en":"fresh cilantro","name_es":"cilantro fresco","quantity":"0.5","unit":"cup"},{"name_en":"lime","name_es":"lima","quantity":"2","unit":"piece"},{"name_en":"sea salt","name_es":"sal marina","quantity":"1","unit":"tsp"}]',
  'Dice tomatoes small — remove excess seeds. Finely dice white onion. Mince jalapeño (remove seeds for mild). Chop cilantro finely. Combine all in a bowl. Squeeze lime juice, add salt. Mix and let sit 10 minutes before serving.',
  'Pica los tomates en cubos pequeños — retira el exceso de semillas. Pica finamente la cebolla blanca. Pica el jalapeño (sin semillas para menos picante). Pica el cilantro finamente. Combina todo en un bol. Exprime el jugo de lima, agrega sal. Mezcla y deja reposar 10 minutos antes de servir.',
  true
),

-- ============================================
-- COOKED VEGGIES (5 recipes)
-- ============================================

(
  'Burnt Broccoli',
  'Brócoli Rostizado',
  'High-heat roasted broccoli with olive oil and garlic until deeply charred and crispy.',
  'Brócoli asado a fuego alto con aceite de oliva y ajo hasta estar bien dorado y crujiente.',
  'veggies', NULL, 25, 2,
  ARRAY['vegan', 'gluten-free', 'healthy', 'oven'],
  '[{"name_en":"broccoli florets","name_es":"floretes de brócoli","quantity":"500","unit":"g"},{"name_en":"extra virgin olive oil","name_es":"aceite de oliva extra virgen","quantity":"3","unit":"tbsp"},{"name_en":"garlic cloves","name_es":"dientes de ajo","quantity":"3","unit":"piece"},{"name_en":"sea salt","name_es":"sal marina","quantity":"1","unit":"tsp"},{"name_en":"black pepper","name_es":"pimienta negra","quantity":"0.5","unit":"tsp"},{"name_en":"lemon (to finish)","name_es":"limón (para terminar)","quantity":"0.5","unit":"piece"}]',
  'Preheat oven to 230°C (450°F). Dry broccoli thoroughly — moisture prevents charring. Cut into large florets. Toss with olive oil, minced garlic, salt, and pepper. Spread on a baking sheet with plenty of space. Roast 20-25 minutes without stirring until edges are deeply dark and crispy. Finish with lemon juice.',
  'Precalienta el horno a 230°C. Seca muy bien el brócoli — la humedad impide que se dore. Corta en floretes grandes. Mezcla con aceite de oliva, ajo picado, sal y pimienta. Extiende en una bandeja con bastante espacio. Asa 20-25 minutos sin mover hasta que los bordes estén muy oscuros y crujientes. Termina con un poco de limón.',
  true
),

(
  'Brussels Sprouts — Air Fryer',
  'Coles de Bruselas en Air Fryer',
  'Crispy air-fried Brussels sprouts with olive oil and garlic — caramelized outside, tender inside.',
  'Coles de Bruselas crujientes en air fryer con aceite de oliva y ajo — caramelizadas por fuera, tiernas por dentro.',
  'veggies', NULL, 20, 2,
  ARRAY['vegan', 'gluten-free', 'healthy', 'airfryer'],
  '[{"name_en":"Brussels sprouts","name_es":"coles de Bruselas","quantity":"400","unit":"g"},{"name_en":"extra virgin olive oil","name_es":"aceite de oliva extra virgen","quantity":"2","unit":"tbsp"},{"name_en":"garlic powder","name_es":"ajo en polvo","quantity":"1","unit":"tsp"},{"name_en":"sea salt","name_es":"sal marina","quantity":"0.75","unit":"tsp"},{"name_en":"black pepper","name_es":"pimienta negra","quantity":"0.5","unit":"tsp"},{"name_en":"lemon juice","name_es":"jugo de limón","quantity":"1","unit":"tbsp"}]',
  'Trim ends of Brussels sprouts and remove damaged outer leaves. Halve larger ones. Pat dry. Toss with olive oil, garlic powder, salt, and pepper. Air fry at 200°C (390°F) for 12-15 minutes, shaking the basket halfway, until crispy and golden. Finish with lemon juice.',
  'Recorta los extremos de las coles de Bruselas y retira las hojas dañadas. Corta las más grandes a la mitad. Sécalas bien. Mezcla con aceite de oliva, ajo en polvo, sal y pimienta. Air fríe a 200°C durante 12-15 minutos, agitando la canasta a la mitad, hasta que estén crujientes y doradas. Termina con jugo de limón.',
  true
),

(
  'Roasted Carrots',
  'Zanahorias Rostizadas',
  'Sweet roasted carrots with cumin, olive oil, and fresh herbs — simple and satisfying.',
  'Zanahorias dulces rostizadas con comino, aceite de oliva y hierbas frescas — simples y sabrosas.',
  'veggies', NULL, 35, 2,
  ARRAY['vegan', 'gluten-free', 'healthy', 'oven'],
  '[{"name_en":"carrots","name_es":"zanahorias","quantity":"500","unit":"g"},{"name_en":"extra virgin olive oil","name_es":"aceite de oliva extra virgen","quantity":"2","unit":"tbsp"},{"name_en":"cumin","name_es":"comino","quantity":"1","unit":"tsp"},{"name_en":"garlic powder","name_es":"ajo en polvo","quantity":"0.5","unit":"tsp"},{"name_en":"sea salt","name_es":"sal marina","quantity":"0.75","unit":"tsp"},{"name_en":"black pepper","name_es":"pimienta negra","quantity":"0.5","unit":"tsp"},{"name_en":"fresh parsley or cilantro","name_es":"perejil fresco o cilantro","quantity":"2","unit":"tbsp"}]',
  'Preheat oven to 220°C (425°F). Peel carrots and cut into diagonal pieces about 5cm long. Toss with olive oil, cumin, garlic powder, salt, and pepper. Spread on a baking sheet. Roast 25-30 minutes, turning once halfway, until tender and caramelized at the edges. Garnish with fresh herbs.',
  'Precalienta el horno a 220°C. Pela las zanahorias y córtalas en trozos diagonales de 5 cm. Mezcla con aceite de oliva, comino, ajo en polvo, sal y pimienta. Extiende en una bandeja. Asa 25-30 minutos, girando a la mitad, hasta que estén tiernas y caramelizadas. Decora con hierbas frescas.',
  true
),

(
  'Split Green Peas',
  'Chícharos Verdes Partidos',
  'Creamy split pea side cooked with garlic and cumin — nutritious and high in fiber.',
  'Acompañamiento cremoso de chícharos verdes partidos con ajo y comino — nutritivo y alto en fibra.',
  'veggies', NULL, 45, 4,
  ARRAY['vegan', 'gluten-free', 'healthy', 'high-fiber', 'meal-prep'],
  '[{"name_en":"green split peas","name_es":"chícharos verdes partidos","quantity":"250","unit":"g"},{"name_en":"onion","name_es":"cebolla","quantity":"1","unit":"piece"},{"name_en":"garlic cloves","name_es":"dientes de ajo","quantity":"3","unit":"piece"},{"name_en":"cumin","name_es":"comino","quantity":"1.5","unit":"tsp"},{"name_en":"turmeric","name_es":"cúrcuma","quantity":"0.5","unit":"tsp"},{"name_en":"extra virgin olive oil","name_es":"aceite de oliva extra virgen","quantity":"2","unit":"tbsp"},{"name_en":"vegetable broth or water","name_es":"caldo de verduras o agua","quantity":"600","unit":"ml"},{"name_en":"sea salt","name_es":"sal marina","quantity":"1","unit":"tsp"}]',
  'Rinse split peas. Heat olive oil in a pot over medium heat. Sauté diced onion until soft, about 5 minutes. Add minced garlic, cumin, and turmeric; cook 1 minute. Add split peas and broth. Bring to a boil, reduce heat, and simmer 35-40 minutes until peas are very tender and creamy. Season with salt.',
  'Enjuaga los chícharos. Calienta el aceite en una olla a fuego medio. Sofríe la cebolla picada hasta que esté suave, unos 5 minutos. Agrega el ajo picado, el comino y la cúrcuma; cocina 1 minuto. Agrega los chícharos y el caldo. Lleva a ebullición, reduce el fuego y cocina a fuego lento 35-40 minutos hasta que estén muy tiernos y cremosos. Sazona con sal.',
  true
),

(
  'Cauliflower Rice',
  'Arroz de Coliflor',
  'Light cauliflower rice sautéed with garlic and olive oil — a low-carb rice substitute.',
  'Arroz de coliflor ligero salteado con ajo y aceite de oliva — un sustituto de arroz bajo en carbohidratos.',
  'veggies', NULL, 15, 2,
  ARRAY['vegan', 'gluten-free', 'healthy', 'low-carb', 'quick'],
  '[{"name_en":"cauliflower head","name_es":"coliflor","quantity":"1","unit":"piece"},{"name_en":"garlic cloves","name_es":"dientes de ajo","quantity":"2","unit":"piece"},{"name_en":"extra virgin olive oil","name_es":"aceite de oliva extra virgen","quantity":"2","unit":"tbsp"},{"name_en":"sea salt","name_es":"sal marina","quantity":"0.75","unit":"tsp"},{"name_en":"black pepper","name_es":"pimienta negra","quantity":"0.25","unit":"tsp"},{"name_en":"lime juice","name_es":"jugo de lima","quantity":"1","unit":"tbsp"},{"name_en":"fresh cilantro or parsley","name_es":"cilantro fresco o perejil","quantity":"2","unit":"tbsp"}]',
  'Pulse cauliflower florets in a food processor until it resembles rice — do not over-process. Heat olive oil in a large skillet over medium-high heat. Add minced garlic, cook 30 seconds. Add cauliflower rice, spread evenly. Cook 5-7 minutes, stirring occasionally, until tender but not mushy. Season with salt, pepper, lime juice, and herbs.',
  'Procesa los floretes de coliflor en un procesador hasta que parezca arroz — no sobre-proceses. Calienta el aceite en una sartén grande a fuego medio-alto. Agrega el ajo picado, cocina 30 segundos. Agrega el arroz de coliflor, extiende uniformemente. Cocina 5-7 minutos, revolviendo ocasionalmente, hasta que esté tierno pero no pastoso. Sazona con sal, pimienta, jugo de lima y hierbas.',
  true
),

-- ============================================
-- CARBS (5 recipes)
-- ============================================

(
  'White Rice',
  'Arroz Blanco',
  'Perfectly fluffy white rice cooked with garlic and olive oil — simple Mexican-style.',
  'Arroz blanco perfectamente esponjoso cocinado con ajo y aceite de oliva — estilo mexicano sencillo.',
  'carbs', NULL, 25, 4,
  ARRAY['vegan', 'gluten-free', 'simple', 'side-dish'],
  '[{"name_en":"white long-grain rice","name_es":"arroz blanco de grano largo","quantity":"1.5","unit":"cups"},{"name_en":"garlic cloves","name_es":"dientes de ajo","quantity":"2","unit":"piece"},{"name_en":"extra virgin olive oil","name_es":"aceite de oliva extra virgen","quantity":"1","unit":"tbsp"},{"name_en":"water or chicken broth","name_es":"agua o caldo de pollo","quantity":"3","unit":"cups"},{"name_en":"sea salt","name_es":"sal marina","quantity":"1","unit":"tsp"}]',
  'Rinse rice until water runs clear. Heat olive oil in a saucepan over medium heat. Add minced garlic and cook 30 seconds. Add rice and toast 1-2 minutes. Add water or broth and salt. Bring to a boil, reduce heat to low, cover, cook 18 minutes without lifting the lid. Rest 5 minutes. Fluff with a fork.',
  'Enjuaga el arroz hasta que el agua salga clara. Calienta el aceite en una cacerola a fuego medio. Agrega el ajo picado y cocina 30 segundos. Agrega el arroz y tuesta 1-2 minutos. Agrega el agua o caldo y la sal. Lleva a ebullición, reduce al mínimo, tapa y cocina 18 minutos sin destapar. Reposa 5 minutos. Esponja con tenedor.',
  true
),

(
  'Mashed Potatoes',
  'Puré de Papa',
  'Creamy mashed potatoes with olive oil, garlic, and butter — comfort food at its best.',
  'Puré de papa cremoso con aceite de oliva, ajo y mantequilla — comida reconfortante en su mejor versión.',
  'carbs', NULL, 30, 4,
  ARRAY['vegetarian', 'gluten-free', 'comfort', 'side-dish'],
  '[{"name_en":"Yukon Gold potatoes","name_es":"papas Yukon Gold","quantity":"800","unit":"g"},{"name_en":"garlic cloves","name_es":"dientes de ajo","quantity":"3","unit":"piece"},{"name_en":"butter","name_es":"mantequilla","quantity":"2","unit":"tbsp"},{"name_en":"extra virgin olive oil","name_es":"aceite de oliva extra virgen","quantity":"2","unit":"tbsp"},{"name_en":"warm milk","name_es":"leche tibia","quantity":"0.5","unit":"cup"},{"name_en":"sea salt","name_es":"sal marina","quantity":"1.5","unit":"tsp"},{"name_en":"white pepper","name_es":"pimienta blanca","quantity":"0.25","unit":"tsp"}]',
  'Peel and cube potatoes. Boil in salted water with whole garlic cloves until very tender, about 20 minutes. Drain well. Mash with a potato masher — do not use a blender (makes them gluey). Add butter and olive oil. Add warm milk gradually until desired consistency. Season with salt and white pepper.',
  'Pela y corta las papas en cubos. Hierve en agua con sal con los dientes de ajo enteros hasta que estén muy tiernas, unos 20 minutos. Escurre bien. Aplasta con prensapapas — no uses licuadora (quedan pegajosas). Agrega la mantequilla y el aceite. Agrega la leche tibia gradualmente hasta la consistencia deseada. Sazona con sal y pimienta blanca.',
  true
),

(
  'Sweet Potatoes — Air Fryer',
  'Camote en Air Fryer',
  'Air-fried sweet potato rounds with cinnamon and olive oil — crispy outside, fluffy inside.',
  'Rodajas de camote en air fryer con canela y aceite de oliva — crujientes por fuera, esponjosas por dentro.',
  'carbs', NULL, 25, 2,
  ARRAY['vegan', 'gluten-free', 'healthy', 'airfryer'],
  '[{"name_en":"sweet potatoes","name_es":"camotes","quantity":"400","unit":"g"},{"name_en":"extra virgin olive oil","name_es":"aceite de oliva extra virgen","quantity":"1.5","unit":"tbsp"},{"name_en":"cinnamon","name_es":"canela","quantity":"0.5","unit":"tsp"},{"name_en":"sea salt","name_es":"sal marina","quantity":"0.5","unit":"tsp"}]',
  'Peel sweet potatoes and cut into 1.5cm rounds or cubes. Toss with olive oil, cinnamon, and salt. Air fry at 200°C (390°F) for 15-18 minutes, shaking the basket halfway, until golden and tender.',
  'Pela los camotes y córtalos en rodajas de 1.5 cm o en cubos. Mezcla con aceite de oliva, canela y sal. Air fríe a 200°C durante 15-18 minutos, agitando la canasta a la mitad, hasta que estén dorados y tiernos.',
  true
),

(
  'Dal — Curry Lentil Soup',
  'Sopa de Lentejas al Curry',
  'Warming red lentil dal with coconut milk, turmeric, and ginger — rich and high in fiber.',
  'Dal de lentejas rojas reconfortante con leche de coco, cúrcuma y jengibre — rico y alto en fibra.',
  'carbs', NULL, 40, 4,
  ARRAY['vegan', 'gluten-free', 'healthy', 'high-fiber', 'meal-prep'],
  '[{"name_en":"red lentils","name_es":"lentejas rojas","quantity":"250","unit":"g"},{"name_en":"onion","name_es":"cebolla","quantity":"1","unit":"piece"},{"name_en":"garlic cloves","name_es":"dientes de ajo","quantity":"4","unit":"piece"},{"name_en":"fresh ginger","name_es":"jengibre fresco","quantity":"2","unit":"cm"},{"name_en":"turmeric","name_es":"cúrcuma","quantity":"1","unit":"tsp"},{"name_en":"garam masala","name_es":"garam masala","quantity":"1.5","unit":"tsp"},{"name_en":"cumin","name_es":"comino","quantity":"1","unit":"tsp"},{"name_en":"unsweetened coconut milk","name_es":"leche de coco sin azúcar","quantity":"400","unit":"ml"},{"name_en":"crushed tomatoes","name_es":"tomate triturado","quantity":"400","unit":"ml"},{"name_en":"vegetable broth","name_es":"caldo de verduras","quantity":"300","unit":"ml"},{"name_en":"extra virgin olive oil","name_es":"aceite de oliva extra virgen","quantity":"2","unit":"tbsp"},{"name_en":"sea salt","name_es":"sal marina","quantity":"1.5","unit":"tsp"},{"name_en":"fresh cilantro","name_es":"cilantro fresco","quantity":"0.25","unit":"cup"},{"name_en":"lime","name_es":"lima","quantity":"1","unit":"piece"}]',
  'Rinse lentils. Heat olive oil in a large pot over medium heat. Sauté diced onion until golden, about 8 minutes. Add minced garlic and grated ginger, cook 2 minutes. Add turmeric, garam masala, and cumin; stir 1 minute. Add lentils, crushed tomatoes, coconut milk, and broth. Bring to a boil, reduce heat, and simmer 25-30 minutes until lentils are soft. Season with salt and lime juice. Garnish with cilantro.',
  'Enjuaga las lentejas. Calienta el aceite en una olla grande a fuego medio. Sofríe la cebolla picada hasta que esté dorada, unos 8 minutos. Agrega el ajo picado y el jengibre rallado, cocina 2 minutos. Agrega la cúrcuma, el garam masala y el comino; revuelve 1 minuto. Agrega las lentejas, el tomate triturado, la leche de coco y el caldo. Lleva a ebullición, reduce el fuego y cocina 25-30 minutos hasta que las lentejas estén suaves. Sazona con sal y jugo de lima. Decora con cilantro.',
  true
),

(
  'Oatmeal Blueberry Pancakes',
  'Pancakes de Avena con Arándanos',
  'Batch-cook oat pancakes with blueberries — make 20+ and freeze. No flour, no added sugar.',
  'Pancakes de avena con arándanos para hacer en cantidad — prepara 20+ y congela. Sin harina ni azúcar añadida.',
  'carbs', NULL, 40, 20,
  ARRAY['gluten-free', 'batch-cook', 'freezer-friendly', 'meal-prep', 'no-added-sugar', 'healthy'],
  '[{"name_en":"rolled oats","name_es":"avena en hojuelas","quantity":"3","unit":"cups"},{"name_en":"eggs (brown, DAC)","name_es":"huevos (marrones de DAC)","quantity":"4","unit":"piece"},{"name_en":"ripe bananas","name_es":"plátanos maduros","quantity":"2","unit":"piece"},{"name_en":"unsweetened coconut milk","name_es":"leche de coco sin azúcar","quantity":"1","unit":"cup"},{"name_en":"fresh or frozen blueberries","name_es":"arándanos frescos o congelados","quantity":"1.5","unit":"cups"},{"name_en":"baking powder","name_es":"polvo para hornear","quantity":"2","unit":"tsp"},{"name_en":"vanilla extract","name_es":"extracto de vainilla","quantity":"1","unit":"tsp"},{"name_en":"cinnamon","name_es":"canela","quantity":"1","unit":"tsp"},{"name_en":"sea salt","name_es":"sal marina","quantity":"0.5","unit":"tsp"}]',
  'Blend oats into flour. Mash bananas in a large bowl. Whisk in eggs, coconut milk, vanilla, and cinnamon. Add oat flour, baking powder, and salt; stir to combine. Fold in blueberries. Heat a non-stick pan over medium-low with a tiny bit of olive oil. Pour 3 tbsp batter per pancake. Cook 3 minutes until bubbles form, flip, cook 2 more minutes. Cool completely before storing in freezer bags with parchment between each pancake.',
  'Licúa la avena hasta obtener harina. Aplasta los plátanos en un bol grande. Bate los huevos, la leche de coco, la vainilla y la canela. Agrega la harina de avena, el polvo para hornear y la sal; mezcla. Incorpora los arándanos con movimientos envolventes. Calienta un sartén antiadherente a fuego medio-bajo con muy poco aceite. Vierte 3 cucharadas de mezcla por panque. Cocina 3 minutos hasta que aparezcan burbujas, voltea, cocina 2 minutos más. Enfría completamente antes de guardar en bolsas de congelador con papel pergamino entre cada panque.',
  true
),

-- ============================================
-- BEEF (3 recipes)
-- ============================================

(
  'Meatballs with Herbs and Spices',
  'Albóndigas con Hierbas y Especias',
  'Juicy extra-lean beef meatballs with fresh herbs and garlic — great for batch cooking.',
  'Albóndigas jugosas de carne extra magra con hierbas frescas y ajo — perfectas para hacer en cantidad.',
  'beef', 'beef', 45, 4,
  ARRAY['beef', 'meal-prep', 'gluten-free', 'high-protein'],
  '[{"name_en":"extra-lean ground beef (Chedraui Select)","name_es":"carne molida extra magra (Chedraui Select)","quantity":"500","unit":"g"},{"name_en":"garlic cloves","name_es":"dientes de ajo","quantity":"3","unit":"piece"},{"name_en":"fresh parsley","name_es":"perejil fresco","quantity":"3","unit":"tbsp"},{"name_en":"fresh oregano","name_es":"orégano fresco","quantity":"1","unit":"tbsp"},{"name_en":"egg","name_es":"huevo","quantity":"1","unit":"piece"},{"name_en":"cumin","name_es":"comino","quantity":"1","unit":"tsp"},{"name_en":"smoked paprika","name_es":"pimentón ahumado","quantity":"1","unit":"tsp"},{"name_en":"sea salt","name_es":"sal marina","quantity":"1","unit":"tsp"},{"name_en":"black pepper","name_es":"pimienta negra","quantity":"0.5","unit":"tsp"},{"name_en":"extra virgin olive oil","name_es":"aceite de oliva extra virgen","quantity":"2","unit":"tbsp"}]',
  'Combine ground beef, minced garlic, chopped parsley, oregano, egg, cumin, paprika, salt, and pepper. Mix gently — do not overmix. Form into 4cm balls (about 2 tbsp each). Heat olive oil in an oven-safe skillet over medium-high. Sear meatballs turning to brown all sides, about 5-6 minutes. Transfer to 200°C oven and bake 10-12 minutes until cooked through.',
  'Combina la carne molida, el ajo picado, el perejil, el orégano, el huevo, el comino, el pimentón, la sal y la pimienta. Mezcla suavemente — no mezcles de más. Forma bolitas de 4 cm (unas 2 cucharadas cada una). Calienta el aceite en una sartén apta para horno a fuego medio-alto. Sella las albóndigas girando para dorar todos los lados, unos 5-6 minutos. Pasa al horno a 200°C y hornea 10-12 minutos hasta que estén bien cocidas.',
  true
),

(
  'Ground Beef — Extra Lean',
  'Carne Molida Extra Magra',
  'Simply seasoned extra-lean ground beef from Chedraui Select — versatile base for many dishes. No ternera.',
  'Carne molida extra magra simplemente sazonada de Chedraui Select — base versátil para muchos platillos. Sin ternera.',
  'beef', 'beef', 20, 4,
  ARRAY['beef', 'meal-prep', 'gluten-free', 'high-protein', 'quick'],
  '[{"name_en":"extra-lean ground beef (Chedraui Select, NOT ternera)","name_es":"carne molida extra magra (Chedraui Select, NO ternera)","quantity":"500","unit":"g"},{"name_en":"garlic cloves","name_es":"dientes de ajo","quantity":"3","unit":"piece"},{"name_en":"onion","name_es":"cebolla","quantity":"0.5","unit":"piece"},{"name_en":"cumin","name_es":"comino","quantity":"1","unit":"tsp"},{"name_en":"smoked paprika","name_es":"pimentón ahumado","quantity":"1","unit":"tsp"},{"name_en":"sea salt","name_es":"sal marina","quantity":"1","unit":"tsp"},{"name_en":"black pepper","name_es":"pimienta negra","quantity":"0.5","unit":"tsp"},{"name_en":"extra virgin olive oil","name_es":"aceite de oliva extra virgen","quantity":"1","unit":"tbsp"}]',
  'Heat olive oil in a large skillet over medium-high. Sauté diced onion 3 minutes. Add minced garlic, cook 1 minute. Add ground beef and break up with a spoon. Season with cumin, paprika, salt, and pepper. Cook 8-10 minutes until fully browned. Drain excess fat if needed.',
  'Calienta el aceite en una sartén grande a fuego medio-alto. Sofríe la cebolla picada 3 minutos. Agrega el ajo picado, cocina 1 minuto. Agrega la carne molida y desbarata con una cuchara. Sazona con comino, pimentón, sal y pimienta. Cocina 8-10 minutos hasta que esté completamente dorada. Escurre el exceso de grasa si es necesario.',
  true
),

(
  'Burrito Bowl',
  'Bowl de Burrito',
  'Extra-lean ground beef burrito bowl with cauliflower rice, black beans, and fresh toppings.',
  'Bowl de burrito con carne molida extra magra, arroz de coliflor, frijoles negros y toppings frescos.',
  'beef', 'beef', 35, 2,
  ARRAY['beef', 'gluten-free', 'high-protein', 'bowl', 'mexican'],
  '[{"name_en":"extra-lean ground beef (Chedraui Select)","name_es":"carne molida extra magra (Chedraui Select)","quantity":"300","unit":"g"},{"name_en":"cauliflower rice","name_es":"arroz de coliflor","quantity":"2","unit":"cups"},{"name_en":"black beans (drained)","name_es":"frijoles negros (escurridos)","quantity":"1","unit":"cup"},{"name_en":"cherry tomatoes","name_es":"tomates cherry","quantity":"0.5","unit":"cup"},{"name_en":"avocado","name_es":"aguacate","quantity":"1","unit":"piece"},{"name_en":"red onion","name_es":"cebolla morada","quantity":"0.25","unit":"piece"},{"name_en":"fresh cilantro","name_es":"cilantro fresco","quantity":"3","unit":"tbsp"},{"name_en":"lime","name_es":"lima","quantity":"1","unit":"piece"},{"name_en":"cumin","name_es":"comino","quantity":"1","unit":"tsp"},{"name_en":"smoked paprika","name_es":"pimentón ahumado","quantity":"1","unit":"tsp"},{"name_en":"sea salt","name_es":"sal marina","quantity":"1","unit":"tsp"},{"name_en":"extra virgin olive oil","name_es":"aceite de oliva extra virgen","quantity":"1","unit":"tbsp"}]',
  'Cook ground beef with cumin, paprika, and salt in a skillet. Prepare cauliflower rice separately. Warm black beans. Slice avocado, halve cherry tomatoes, dice red onion. Build bowls: cauliflower rice base, then beef, black beans, tomatoes, avocado, and red onion. Squeeze lime juice over everything. Garnish with cilantro.',
  'Cocina la carne molida con comino, pimentón y sal en una sartén. Prepara el arroz de coliflor aparte. Calienta los frijoles. Rebana el aguacate, parte los tomates cherry a la mitad, pica la cebolla morada. Arma los bowls: base de arroz de coliflor, luego carne, frijoles, tomates, aguacate y cebolla. Exprime jugo de lima. Decora con cilantro.',
  true
),

-- ============================================
-- CHICKEN (8 recipes)
-- ============================================

(
  'Chicken Souvlaki with Tzatziki and Wraps',
  'Souvlaki de Pollo con Tzatziki y Wraps',
  'Marinated grilled chicken breast skewers with homemade tzatziki and fresh wraps.',
  'Brochetas de pechuga de pollo marinada a la parrilla con tzatziki casero y wraps frescos.',
  'chicken', 'chicken breast', 40, 2,
  ARRAY['chicken', 'grill', 'mediterranean', 'high-protein'],
  '[{"name_en":"chicken breast","name_es":"pechuga de pollo","quantity":"400","unit":"g"},{"name_en":"extra virgin olive oil","name_es":"aceite de oliva extra virgen","quantity":"3","unit":"tbsp"},{"name_en":"lemon juice","name_es":"jugo de limón","quantity":"2","unit":"tbsp"},{"name_en":"garlic cloves","name_es":"dientes de ajo","quantity":"3","unit":"piece"},{"name_en":"dried oregano","name_es":"orégano seco","quantity":"1.5","unit":"tsp"},{"name_en":"cumin","name_es":"comino","quantity":"0.5","unit":"tsp"},{"name_en":"sea salt","name_es":"sal marina","quantity":"1","unit":"tsp"},{"name_en":"black pepper","name_es":"pimienta negra","quantity":"0.5","unit":"tsp"},{"name_en":"Greek yogurt (Chobani)","name_es":"yogur griego (Chobani)","quantity":"1","unit":"cup"},{"name_en":"cucumber (for tzatziki)","name_es":"pepino (para tzatziki)","quantity":"0.5","unit":"piece"},{"name_en":"garlic clove (for tzatziki)","name_es":"diente de ajo (para tzatziki)","quantity":"1","unit":"piece"},{"name_en":"fresh dill or mint","name_es":"eneldo fresco o menta","quantity":"2","unit":"tbsp"},{"name_en":"whole wheat wraps","name_es":"wraps de trigo integral","quantity":"4","unit":"piece"}]',
  'Cut chicken into 3cm chunks. Marinate in olive oil, lemon, minced garlic, oregano, cumin, salt, and pepper at least 30 minutes. Thread onto skewers. Grill or cook in a grill pan over medium-high 4-5 minutes per side until cooked through. For tzatziki: grate cucumber, squeeze out excess water, mix with Greek yogurt, minced garlic, chopped dill, salt, and olive oil. Serve in wraps with tzatziki.',
  'Corta el pollo en trozos de 3 cm. Marina en aceite de oliva, limón, ajo picado, orégano, comino, sal y pimienta al menos 30 minutos. Ensarta en brochetas. Asa a fuego medio-alto 4-5 minutos por lado hasta que esté bien cocido. Para el tzatziki: ralla el pepino, exprímelo, mezcla con yogur griego, ajo picado, eneldo, sal y aceite. Sirve en wraps con tzatziki.',
  true
),

(
  'Pad Thai with Chicken',
  'Pad Thai con Pollo',
  'Thai-style stir-fried rice noodles with chicken breast, egg, and fresh garnishes.',
  'Fideos de arroz salteados al estilo tailandés con pechuga de pollo, huevo y guarniciones frescas.',
  'chicken', 'chicken breast', 35, 2,
  ARRAY['chicken', 'asian', 'high-protein'],
  '[{"name_en":"chicken breast","name_es":"pechuga de pollo","quantity":"300","unit":"g"},{"name_en":"rice noodles","name_es":"fideos de arroz","quantity":"150","unit":"g"},{"name_en":"eggs (brown, DAC)","name_es":"huevos (marrones de DAC)","quantity":"2","unit":"piece"},{"name_en":"bean sprouts","name_es":"brotes de soya","quantity":"1","unit":"cup"},{"name_en":"green onions","name_es":"cebollitas de cambray","quantity":"3","unit":"piece"},{"name_en":"garlic cloves","name_es":"dientes de ajo","quantity":"2","unit":"piece"},{"name_en":"tamari (gluten-free soy sauce)","name_es":"tamari (salsa de soya sin gluten)","quantity":"3","unit":"tbsp"},{"name_en":"fish sauce","name_es":"salsa de pescado","quantity":"1","unit":"tbsp"},{"name_en":"lime","name_es":"lima","quantity":"1","unit":"piece"},{"name_en":"extra virgin olive oil","name_es":"aceite de oliva extra virgen","quantity":"2","unit":"tbsp"},{"name_en":"crushed peanuts","name_es":"cacahuates triturados","quantity":"3","unit":"tbsp"},{"name_en":"fresh cilantro","name_es":"cilantro fresco","quantity":"3","unit":"tbsp"}]',
  'Soak rice noodles in warm water 20 minutes; drain. Slice chicken thin and season with salt. Heat oil in a wok over high heat. Stir-fry chicken 3-4 minutes until cooked. Push to side, scramble eggs in same pan. Add noodles, tamari, and fish sauce. Toss everything together 2-3 minutes. Add bean sprouts and green onions, toss 1 minute. Top with peanuts, cilantro, and lime wedges.',
  'Remoja los fideos en agua tibia 20 minutos; escurre. Rebana el pollo finamente y sazona con sal. Calienta el aceite en un wok a fuego alto. Sofríe el pollo 3-4 minutos hasta que esté cocido. Empuja a un lado, revuelve los huevos en la misma sartén. Agrega los fideos, el tamari y la salsa de pescado. Mezcla todo 2-3 minutos. Agrega los brotes y las cebollitas, mezcla 1 minuto. Decora con cacahuates, cilantro y limones.',
  true
),

(
  'Grilled Chicken Breast',
  'Pechuga de Pollo a la Parrilla',
  'Simply grilled chicken breast with olive oil, garlic, and herbs — lean protein staple.',
  'Pechuga de pollo simplemente asada a la parrilla con aceite de oliva, ajo y hierbas — proteína magra esencial.',
  'chicken', 'chicken breast', 25, 2,
  ARRAY['chicken', 'grill', 'high-protein', 'gluten-free', 'quick'],
  '[{"name_en":"chicken breasts","name_es":"pechugas de pollo","quantity":"2","unit":"piece"},{"name_en":"extra virgin olive oil","name_es":"aceite de oliva extra virgen","quantity":"2","unit":"tbsp"},{"name_en":"garlic cloves","name_es":"dientes de ajo","quantity":"2","unit":"piece"},{"name_en":"fresh lemon juice","name_es":"jugo de limón fresco","quantity":"2","unit":"tbsp"},{"name_en":"dried thyme","name_es":"tomillo seco","quantity":"1","unit":"tsp"},{"name_en":"dried oregano","name_es":"orégano seco","quantity":"1","unit":"tsp"},{"name_en":"sea salt","name_es":"sal marina","quantity":"1","unit":"tsp"},{"name_en":"black pepper","name_es":"pimienta negra","quantity":"0.5","unit":"tsp"}]',
  'Pound chicken breasts to even 2cm thickness. Mix olive oil, minced garlic, lemon juice, thyme, oregano, salt, and pepper. Coat chicken and marinate at least 15 minutes. Grill over medium-high 5-6 minutes per side until internal temp reaches 74°C (165°F). Rest 5 minutes before slicing.',
  'Aplana las pechugas a un grosor uniforme de 2 cm. Mezcla aceite de oliva, ajo picado, jugo de limón, tomillo, orégano, sal y pimienta. Cubre el pollo y marina al menos 15 minutos. Asa a fuego medio-alto 5-6 minutos por lado hasta que la temperatura interna llegue a 74°C. Deja reposar 5 minutos antes de rebanar.',
  true
),

(
  'Almond Breaded Chicken Fingers',
  'Dedos de Pollo Empanizados con Almendra',
  'Crispy chicken tenders coated in almond flour and spices — baked or air-fried, gluten-free.',
  'Tiras de pollo crujientes empanizadas con harina de almendra y especias — horneadas o en air fryer, sin gluten.',
  'chicken', 'chicken breast', 35, 2,
  ARRAY['chicken', 'gluten-free', 'airfryer', 'oven', 'high-protein'],
  '[{"name_en":"chicken breast","name_es":"pechuga de pollo","quantity":"400","unit":"g"},{"name_en":"almond flour","name_es":"harina de almendra","quantity":"1","unit":"cup"},{"name_en":"eggs (brown, DAC)","name_es":"huevos (marrones de DAC)","quantity":"2","unit":"piece"},{"name_en":"garlic powder","name_es":"ajo en polvo","quantity":"1","unit":"tsp"},{"name_en":"smoked paprika","name_es":"pimentón ahumado","quantity":"1","unit":"tsp"},{"name_en":"cumin","name_es":"comino","quantity":"0.5","unit":"tsp"},{"name_en":"sea salt","name_es":"sal marina","quantity":"1","unit":"tsp"},{"name_en":"black pepper","name_es":"pimienta negra","quantity":"0.5","unit":"tsp"}]',
  'Cut chicken into finger-sized strips. Whisk eggs in a bowl. Mix almond flour with garlic powder, paprika, cumin, salt, and pepper in another bowl. Dip each strip in egg, then coat in almond flour. AIR FRYER: 200°C for 12-15 minutes, flipping halfway. OVEN: Oiled baking sheet at 220°C for 20 minutes, flipping halfway.',
  'Corta las pechugas en tiras del tamaño de un dedo. Bate los huevos en un bol. Mezcla la harina de almendra con ajo en polvo, pimentón, comino, sal y pimienta en otro bol. Sumerge cada tira en huevo y cubre con la mezcla de almendra. AIR FRYER: 200°C 12-15 minutos, volteando a la mitad. HORNO: Bandeja aceitada a 220°C 20 minutos, volteando a la mitad.',
  true
),

(
  'Chicken Fajitas',
  'Fajitas de Pollo',
  'Sizzling chicken breast fajitas with bell peppers and onion — serve with wraps and fresh toppings.',
  'Fajitas de pechuga de pollo chisporroteantes con pimientos y cebolla — servir con wraps y toppings frescos.',
  'chicken', 'chicken breast', 30, 2,
  ARRAY['chicken', 'mexican', 'gluten-free', 'quick'],
  '[{"name_en":"chicken breast","name_es":"pechuga de pollo","quantity":"400","unit":"g"},{"name_en":"mixed bell peppers","name_es":"pimientos mixtos","quantity":"2","unit":"piece"},{"name_en":"onion","name_es":"cebolla","quantity":"1","unit":"piece"},{"name_en":"garlic cloves","name_es":"dientes de ajo","quantity":"2","unit":"piece"},{"name_en":"extra virgin olive oil","name_es":"aceite de oliva extra virgen","quantity":"2","unit":"tbsp"},{"name_en":"cumin","name_es":"comino","quantity":"1","unit":"tsp"},{"name_en":"smoked paprika","name_es":"pimentón ahumado","quantity":"1","unit":"tsp"},{"name_en":"chili powder","name_es":"chile en polvo","quantity":"0.5","unit":"tsp"},{"name_en":"lime","name_es":"lima","quantity":"1","unit":"piece"},{"name_en":"sea salt","name_es":"sal marina","quantity":"1","unit":"tsp"},{"name_en":"whole wheat wraps","name_es":"wraps de trigo integral","quantity":"4","unit":"piece"}]',
  'Slice chicken breast into thin strips. Season with cumin, paprika, chili powder, salt, and minced garlic. Slice bell peppers and onion into thin strips. Heat olive oil in a cast-iron skillet over high heat. Cook chicken 3-4 minutes without stirring, flip, cook 2 more minutes. Remove chicken, add peppers and onion, cook 4-5 minutes until slightly charred. Combine with chicken and finish with lime juice. Serve in wraps.',
  'Corta la pechuga en tiras finas. Sazona con comino, pimentón, chile en polvo, sal y ajo picado. Rebana los pimientos y la cebolla en tiras. Calienta el aceite en una sartén de hierro a fuego alto. Cocina el pollo 3-4 minutos sin mover, voltea, cocina 2 minutos más. Retira el pollo, agrega los pimientos y la cebolla, cocina 4-5 minutos hasta que estén ligeramente dorados. Combina con el pollo y termina con jugo de lima. Sirve en wraps.',
  true
),

(
  'Chicken Tinga',
  'Tinga de Pollo',
  'Shredded chicken breast in a smoky chipotle tomato sauce — classic Mexican tinga.',
  'Pechuga de pollo desmenuzada en salsa de tomate con chipotle ahumado — tinga mexicana clásica.',
  'chicken', 'chicken breast', 45, 4,
  ARRAY['chicken', 'mexican', 'gluten-free', 'meal-prep'],
  '[{"name_en":"chicken breasts","name_es":"pechugas de pollo","quantity":"500","unit":"g"},{"name_en":"tomatoes","name_es":"tomates","quantity":"3","unit":"piece"},{"name_en":"chipotle in adobo","name_es":"chipotle en adobo","quantity":"2","unit":"piece"},{"name_en":"onion","name_es":"cebolla","quantity":"1","unit":"piece"},{"name_en":"garlic cloves","name_es":"dientes de ajo","quantity":"3","unit":"piece"},{"name_en":"dried oregano","name_es":"orégano seco","quantity":"1","unit":"tsp"},{"name_en":"cumin","name_es":"comino","quantity":"0.5","unit":"tsp"},{"name_en":"chicken broth","name_es":"caldo de pollo","quantity":"0.5","unit":"cup"},{"name_en":"extra virgin olive oil","name_es":"aceite de oliva extra virgen","quantity":"1","unit":"tbsp"},{"name_en":"sea salt","name_es":"sal marina","quantity":"1","unit":"tsp"}]',
  'Simmer chicken breasts in salted water 20-25 minutes until cooked. Shred with two forks. Blend tomatoes and chipotle until smooth. Heat olive oil in a deep skillet over medium. Sauté sliced onion 5 minutes. Add minced garlic, oregano, and cumin, cook 1 minute. Add tomato-chipotle sauce, cook 5 minutes. Add shredded chicken and broth. Simmer 10 minutes until sauce thickens. Season with salt.',
  'Hierve las pechugas en agua con sal 20-25 minutos hasta que estén cocidas. Deshebra con dos tenedores. Licúa los tomates y el chipotle. Calienta el aceite en una sartén profunda a fuego medio. Sofríe la cebolla 5 minutos. Agrega el ajo, el orégano y el comino, cocina 1 minuto. Agrega la salsa, cocina 5 minutos. Agrega el pollo y el caldo. Cocina a fuego lento 10 minutos hasta que espese. Sazona con sal.',
  true
),

(
  'Chicken-Crust Pizza',
  'Pizza con Masa de Pollo',
  'Low-carb pizza with a crust made from ground chicken breast — topped with tomato, cheese, and veggies.',
  'Pizza baja en carbohidratos con masa de pechuga de pollo molida — con tomate, queso y verduras.',
  'chicken', 'chicken breast', 50, 2,
  ARRAY['chicken', 'low-carb', 'gluten-free', 'high-protein'],
  '[{"name_en":"ground chicken breast","name_es":"pechuga de pollo molida","quantity":"400","unit":"g"},{"name_en":"egg","name_es":"huevo","quantity":"1","unit":"piece"},{"name_en":"parmesan cheese","name_es":"queso parmesano","quantity":"0.25","unit":"cup"},{"name_en":"garlic powder","name_es":"ajo en polvo","quantity":"0.5","unit":"tsp"},{"name_en":"Italian herbs","name_es":"hierbas italianas","quantity":"1","unit":"tsp"},{"name_en":"sea salt","name_es":"sal marina","quantity":"0.75","unit":"tsp"},{"name_en":"sugar-free tomato sauce","name_es":"salsa de tomate sin azúcar","quantity":"0.5","unit":"cup"},{"name_en":"mozzarella cheese","name_es":"queso mozzarella","quantity":"150","unit":"g"},{"name_en":"cherry tomatoes","name_es":"tomates cherry","quantity":"0.5","unit":"cup"},{"name_en":"fresh basil","name_es":"albahaca fresca","quantity":"10","unit":"piece"}]',
  'Preheat oven to 220°C. Line a baking sheet with parchment. Combine ground chicken, egg, parmesan, garlic powder, herbs, and salt. Press into a 25cm round (1cm thick). Bake 20 minutes until set and golden. Spread tomato sauce, top with mozzarella and cherry tomatoes. Bake 10 more minutes until cheese is bubbly. Add fresh basil.',
  'Precalienta el horno a 220°C. Forra una bandeja con papel pergamino. Combina el pollo molido, el huevo, el parmesano, el ajo en polvo, las hierbas y la sal. Extiende en un círculo de 25 cm (1 cm de grosor). Hornea 20 minutos hasta que esté firme y dorado. Extiende la salsa de tomate, agrega mozzarella y tomates cherry. Hornea 10 minutos más hasta que el queso burbujee. Decora con albahaca fresca.',
  true
),

(
  'Coconut Cream Curry Chicken',
  'Pollo al Curry con Crema de Coco',
  'Tender chicken breast in a fragrant coconut milk curry with ginger and turmeric.',
  'Pechuga de pollo tierna en un curry fragante de leche de coco con jengibre y cúrcuma.',
  'chicken', 'chicken breast', 40, 2,
  ARRAY['chicken', 'asian', 'gluten-free', 'dairy-free'],
  '[{"name_en":"chicken breast","name_es":"pechuga de pollo","quantity":"400","unit":"g"},{"name_en":"unsweetened coconut milk","name_es":"leche de coco sin azúcar","quantity":"400","unit":"ml"},{"name_en":"onion","name_es":"cebolla","quantity":"1","unit":"piece"},{"name_en":"garlic cloves","name_es":"dientes de ajo","quantity":"3","unit":"piece"},{"name_en":"fresh ginger","name_es":"jengibre fresco","quantity":"2","unit":"cm"},{"name_en":"turmeric","name_es":"cúrcuma","quantity":"1","unit":"tsp"},{"name_en":"curry powder","name_es":"curry en polvo","quantity":"1.5","unit":"tsp"},{"name_en":"garam masala","name_es":"garam masala","quantity":"0.5","unit":"tsp"},{"name_en":"crushed tomatoes","name_es":"tomate triturado","quantity":"200","unit":"ml"},{"name_en":"extra virgin olive oil","name_es":"aceite de oliva extra virgen","quantity":"1.5","unit":"tbsp"},{"name_en":"sea salt","name_es":"sal marina","quantity":"1","unit":"tsp"},{"name_en":"fresh cilantro","name_es":"cilantro fresco","quantity":"3","unit":"tbsp"},{"name_en":"lime","name_es":"lima","quantity":"1","unit":"piece"}]',
  'Cut chicken into 3cm chunks. Heat olive oil in a large skillet over medium. Sauté diced onion 5 minutes. Add minced garlic and grated ginger, cook 2 minutes. Add turmeric, curry powder, and garam masala, stir 1 minute. Add chicken and cook 4-5 minutes. Add crushed tomatoes and coconut milk. Simmer uncovered 20 minutes until sauce thickens and chicken is cooked. Season with salt and lime. Garnish with cilantro.',
  'Corta el pollo en trozos de 3 cm. Calienta el aceite en una sartén grande a fuego medio. Sofríe la cebolla 5 minutos. Agrega el ajo y el jengibre rallado, cocina 2 minutos. Agrega la cúrcuma, el curry y el garam masala, revuelve 1 minuto. Agrega el pollo, cocina 4-5 minutos. Agrega el tomate y la leche de coco. Cocina sin tapar 20 minutos hasta que espese. Sazona con sal y lima. Decora con cilantro.',
  true
),

-- ============================================
-- OTHER PROTEIN (3 recipes)
-- ============================================

(
  'Salmon',
  'Salmón',
  'Pan-seared or grilled salmon fillet with lemon, herbs, and olive oil — simple and elegant.',
  'Filete de salmón sellado en sartén o a la parrilla con limón, hierbas y aceite de oliva — simple y elegante.',
  'other', 'salmon', 20, 2,
  ARRAY['seafood', 'gluten-free', 'high-protein', 'omega-3', 'quick'],
  '[{"name_en":"salmon fillets","name_es":"filetes de salmón","quantity":"2","unit":"piece"},{"name_en":"extra virgin olive oil","name_es":"aceite de oliva extra virgen","quantity":"2","unit":"tbsp"},{"name_en":"garlic cloves","name_es":"dientes de ajo","quantity":"2","unit":"piece"},{"name_en":"lemon","name_es":"limón","quantity":"1","unit":"piece"},{"name_en":"fresh dill or parsley","name_es":"eneldo fresco o perejil","quantity":"2","unit":"tbsp"},{"name_en":"sea salt","name_es":"sal marina","quantity":"0.75","unit":"tsp"},{"name_en":"black pepper","name_es":"pimienta negra","quantity":"0.5","unit":"tsp"}]',
  'Pat salmon dry. Season with salt and pepper. Heat olive oil in a skillet over medium-high. Add salmon skin-side up and cook 4 minutes until golden. Flip and cook 3-4 more minutes to desired doneness. Add minced garlic in the last minute. Finish with lemon juice and fresh herbs.',
  'Seca bien los filetes. Sazona con sal y pimienta. Calienta el aceite en una sartén a fuego medio-alto. Agrega el salmón con la piel hacia arriba y cocina 4 minutos hasta que esté dorado. Voltea y cocina 3-4 minutos más al punto deseado. Agrega el ajo picado en el último minuto. Termina con jugo de limón y hierbas frescas.',
  true
),

(
  'Bacon — Full Bag Once Per Month',
  'Tocino — Bolsa Completa 1 Vez al Mes',
  'Cook the full bag of bacon once a month — not too crispy. Store and use throughout the month.',
  'Cocinar la bolsa completa de tocino una vez al mes — no muy quemado. Guardar y usar durante el mes.',
  'other', NULL, 30, 8,
  ARRAY['batch-cook', 'meal-prep', 'monthly'],
  '[{"name_en":"bacon (full bag, ~500g)","name_es":"tocino (bolsa completa, ~500g)","quantity":"500","unit":"g"}]',
  'IMPORTANT: Cook the FULL bag at once, no more than once per month. Lay strips flat on a parchment-lined baking sheet without overlapping. Bake at 190°C for 15-18 minutes. Remove when cooked through but NOT crispy — it should still be slightly flexible. Drain on paper towels. Cool completely. Store in an airtight container in the fridge up to 1 week, or freeze in zip-lock bags.',
  'IMPORTANTE: Cocinar la bolsa COMPLETA de una vez, no más de una vez al mes. Coloca las tiras planas en una bandeja con papel pergamino sin amontonar. Hornea a 190°C durante 15-18 minutos. Retira cuando esté cocido pero NO crujiente — debe seguir siendo ligeramente flexible. Escurre en papel absorbente. Enfría completamente. Guarda en recipiente hermético en el refrigerador hasta 1 semana, o congela en bolsas zip.',
  true
),

(
  'Egg and Oatmeal Casserole',
  'Cazuela de Huevo y Avena',
  'Hearty baked casserole with eggs, oats, and vegetables — great for batch cooking.',
  'Cazuela horneada sustanciosa con huevos, avena y verduras — ideal para preparar en cantidad.',
  'other', NULL, 50, 6,
  ARRAY['batch-cook', 'gluten-free', 'meal-prep', 'high-protein', 'healthy'],
  '[{"name_en":"eggs (brown, DAC)","name_es":"huevos (marrones de DAC)","quantity":"8","unit":"piece"},{"name_en":"rolled oats","name_es":"avena en hojuelas","quantity":"1","unit":"cup"},{"name_en":"unsweetened coconut milk","name_es":"leche de coco sin azúcar","quantity":"1","unit":"cup"},{"name_en":"spinach","name_es":"espinacas","quantity":"2","unit":"cups"},{"name_en":"bell pepper","name_es":"pimiento","quantity":"1","unit":"piece"},{"name_en":"onion","name_es":"cebolla","quantity":"0.5","unit":"piece"},{"name_en":"garlic cloves","name_es":"dientes de ajo","quantity":"2","unit":"piece"},{"name_en":"extra virgin olive oil","name_es":"aceite de oliva extra virgen","quantity":"1","unit":"tbsp"},{"name_en":"cumin","name_es":"comino","quantity":"1","unit":"tsp"},{"name_en":"sea salt","name_es":"sal marina","quantity":"1","unit":"tsp"},{"name_en":"black pepper","name_es":"pimienta negra","quantity":"0.5","unit":"tsp"}]',
  'Preheat oven to 180°C. Sauté diced onion, bell pepper, and minced garlic in olive oil until soft, about 5 minutes. Add spinach and cook until wilted. Whisk eggs with coconut milk, oats, cumin, salt, and pepper. Stir in cooked vegetables. Pour into a greased 23x33cm baking dish. Bake 30-35 minutes until set and golden. Rest 10 minutes before slicing. Store in fridge up to 5 days.',
  'Precalienta el horno a 180°C. Sofríe la cebolla, el pimiento y el ajo en aceite hasta que estén suaves, unos 5 minutos. Agrega las espinacas hasta que se marchiten. Bate los huevos con la leche de coco, la avena, el comino, la sal y la pimienta. Incorpora las verduras. Vierte en un molde de 23x33 cm engrasado. Hornea 30-35 minutos hasta que esté firme y dorado. Reposa 10 minutos antes de rebanar. Guarda en el refrigerador hasta 5 días.',
  true
);

-- ============================================
-- COOKING RULES (10 rules from spec)
-- ============================================

INSERT INTO cooking_rules (rule_type, rule_definition, is_active) VALUES

(
  'exclusion',
  '{"ingredient": "vegetable oil", "replacement": "extra virgin olive oil", "reason": "Health preference — only EVOO allowed for all cooking"}',
  true
),

(
  'exclusion',
  '{"ingredient": "pork", "reason": "Dietary preference — no pork products (bacon has its own frequency rule)"}',
  true
),

(
  'exclusion',
  '{"ingredient": "added sugar", "note": "Natural sugar OK (fruit, dates). No honey, syrup, or refined sugar.", "reason": "Health preference — no added sugar"}',
  true
),

(
  'exclusion',
  '{"ingredient": "mole sauce", "reason": "Personal preference — neither client likes mole"}',
  true
),

(
  'substitution',
  '{"original": "chicken thighs", "replacement": "chicken breast", "note": "Andrea ONLY eats chicken breast. Neil prefers breast but OK with thighs.", "reason": "Andrea dietary preference"}',
  true
),

(
  'frequency',
  '{"protein": "beef", "max_per": "month", "max_count": 1, "reason": "Health — limit red meat to max 1 beef dish per month"}',
  true
),

(
  'frequency',
  '{"item": "bacon", "max_per": "month", "max_count": 1, "note": "Cook full bag at once, not too crispy. Store remainder in fridge/freezer.", "reason": "Health — limit processed meat to once per month"}',
  true
),

(
  'preference',
  '{"person": "Andrea", "category": "seafood", "allowed": ["salmon", "shrimp"], "reason": "Andrea only eats salmon and shrimp"}',
  true
),

(
  'preference',
  '{"person": "Andrea", "category": "soup", "allowed": ["caldo de pollo"], "reason": "Andrea only likes chicken broth soup"}',
  true
),

(
  'preference',
  '{"person": "Andrea", "category": "salad", "excluded": ["lettuce-based"], "reason": "Andrea does not eat lettuce-based salads"}',
  true
);

-- ============================================
-- FRIDGE STAPLES (always-stock items)
-- ============================================

INSERT INTO fridge_staples (item_name_en, item_name_es, quantity, notes_en, notes_es, category, is_active) VALUES

(
  'Brown eggs (DAC)',
  'Huevos marrones (DAC)',
  '12',
  'Always keep 12 brown eggs from DAC brand. Replenish before they run out.',
  'Mantener siempre 12 huevos marrones de la marca DAC. Reponer antes de que se acaben.',
  'protein',
  true
),

(
  'Greek Yogurt (Chobani)',
  'Yogur Griego (Chobani)',
  '1 large container',
  'Chobani brand, plain, unsweetened.',
  'Marca Chobani, natural, sin azúcar.',
  'dairy',
  true
),

(
  'Coconut Milk (unsweetened)',
  'Leche de Coco (sin azúcar)',
  '2 cans',
  'Must be unsweetened. Keep 2 cans in stock at all times.',
  'Debe ser sin azúcar. Mantener siempre 2 latas en existencia.',
  'pantry',
  true
),

(
  'Limes',
  'Limas',
  '2-6',
  'Keep between 2 and 6 limes on hand at all times.',
  'Mantener siempre entre 2 y 6 limas.',
  'produce',
  true
),

(
  'Red onion',
  'Cebolla morada',
  '1-2',
  'At least one red onion always in stock.',
  'Al menos una cebolla morada siempre en existencia.',
  'produce',
  true
),

(
  'Avocados',
  'Aguacates',
  '3 at staggered ripeness',
  '1 ready to eat today/tomorrow, 1 ripe tomorrow/day after, 1 still green.',
  '1 listo para hoy/mañana, 1 para mañana/pasado, 1 todavía verde.',
  'produce',
  true
),

(
  'Natural sourdough bread (DAC)',
  'Pan de masa madre natural (DAC)',
  '1 loaf',
  'From DAC. Slice the whole loaf and store sliced in a freezer zip-lock bag.',
  'De DAC. Rebanar el pan completo y guardar en una bolsa de congelador.',
  'bakery',
  true
),

(
  'Jalapeño cheddar sourdough bread (DAC)',
  'Pan de masa madre jalapeño cheddar (DAC)',
  '1 loaf (Fridays only)',
  'ONLY available on Fridays at DAC. Slice entire loaf and freeze immediately.',
  'SOLO disponible los viernes en DAC. Rebanar completo y congelar inmediatamente.',
  'bakery',
  true
),

(
  'Oatmeal blueberry pancakes (batch frozen)',
  'Pancakes de avena con arándanos (congelados en cantidad)',
  '4-20',
  'Batch cook 20+ at a time. Freeze in zip-lock bags with parchment between each pancake.',
  'Preparar 20+ a la vez. Congelar en bolsas con papel pergamino entre cada panque.',
  'frozen',
  true
),

(
  'Totopos (tortilla chips)',
  'Totopos',
  '1 bag',
  'Keep one bag of plain totopos. For serving with pico de gallo, guacamole, etc.',
  'Mantener una bolsa de totopos. Para servir con pico de gallo, guacamole, etc.',
  'pantry',
  true
),

(
  'Rotating cheese',
  'Queso rotativo',
  '1 block/container',
  'Rotate between feta, Oaxaca cheese, and cottage cheese. When one runs out, buy a different type.',
  'Rotar entre queso feta, queso Oaxaca y queso cottage. Cuando se acabe uno, comprar un tipo diferente.',
  'dairy',
  true
);
