const fs = require('fs');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

const characterDataPath = 'characterData.json';
const craftRecipesPath = 'craftRecipes.json';


function readJsonFile(path) {
    try {
        const data = fs.readFileSync(path, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Ошибка чтения файла:', err);
        process.exit(1);
    }
}

function writeJsonFile(path, data) {
    try {
        fs.writeFileSync(path, JSON.stringify(data, null, 2));
        console.log('Данные сохранены.');
    } catch (err) {
        console.error('Ошибка записи файла:', err);
        process.exit(1);
    }
}

function readCharacterData() {
    try {
        const data = fs.readFileSync(characterDataPath, 'utf8');
        let characterData = JSON.parse(data) || {hp:0, inventory:[], resources:{}, money:0};

        return characterData;
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.error(`Файл "${characterDataPath}" не найден. Создаю пустой файл...`);
            const initialData = { hp: 500, inventory: [], resources: { materia: 0 }, money: 1000 };
            fs.writeFileSync(characterDataPath, JSON.stringify(initialData, null, 2));
            return initialData;
        } else {
            console.error('Ошибка чтения файла:', err);
            process.exit(1);
        }
    }
}

function writeCharacterData(data) {
    writeJsonFile(characterDataPath, data);
}

function readCraftRecipes() {
    return readJsonFile(craftRecipesPath);
}

function addItem(item) {
    const characterData = readCharacterData();
    characterData.inventory.push({ name: item });
    writeCharacterData(characterData);
    console.log(`Предмет "${item}" добавлен в инвентарь.`);
}

function removeItem(itemName) {
    const characterData = readCharacterData();
    const itemIndex = characterData.inventory.findIndex(item => item.name === itemName);

    if (itemIndex === -1) {
        console.log(`Предмет "${itemName}" не найден в инвентаре.`);
        return;
    }

    characterData.inventory.splice(itemIndex, 1);
    writeCharacterData(characterData);
    console.log(`Предмет "${itemName}" удалён из инвентаря.`);
}

function displayData() {
    const characterData = readCharacterData();
    console.log('Данные персонажа:');
    console.log(characterData);
}

function addResources(resources) {
    const characterData = readCharacterData();
    for (const resource in resources) {
        characterData.resources[resource] = (characterData.resources[resource] || 0) + resources[resource];
    }
    writeCharacterData(characterData);
    console.log(`Ресурсы добавлены.`);
}

function addMateria(amount) {
    addResources({"materia": amount});
}

function craftItem(recipeName) {
    const characterData = readCharacterData();

    if (!characterData.resources) {
        console.error("Ошибка: Невозможно крафтить. Объект resources не определён.");
    }

    const recipes = readCraftRecipes().recipes;
    const recipe = recipes.find(r => r.name === recipeName);

    if (!recipe) {
        console.log(`Рецепт "${recipeName}" не найден.`);
    }

    const hasResources = Object.entries(recipe.ingredients).every(([ingredient, count]) =>
        characterData.resources[ingredient] >= count
    );

    if (!hasResources) {
        for (const [ingredient, count] of Object.entries(recipe.ingredients)) {
            const available = characterData.resources[ingredient] || 0;
            console.log(`Недостаточно ресурса "${ingredient}". Требуется ${count}, есть ${available}.`);
            return;
        }
    }
    // Вычитание ресурсов (НЕ ВЫЧИТАЮТСЯ)
    for (const [ingredient, count] of Object.entries(recipe.ingredients)) {
        characterData.resources[ingredient] -= count;
    }

    // Добавление предмета в инвентарь
    addItem(recipe.result);
}

let change = () => {
    readline.question('Введите команду для изменения данных (add, heal, damage, remove, display, craft, addMoney, addMateria, exit): ', (command) => {
        switch (command) {
            case 'add':
                readline.question('Введите название предмета: ', (item) => addItem(item));
                break;
            case 'heal':
                readline.question('Введите сколько добавить HP: ', (amount) => heal(parseInt(amount)));
                break;
            case 'damage':
                readline.question('Введите сколько нанести урона: ', (amount) => damage(parseInt(amount)));
                break;
            case 'remove':
                readline.question('Введите название предмета для удаления: ', (item) => removeItem(item));
                break;
            case 'addMoney':
                readline.question('Введите количество денег для добавления: ', (amount) => addMoney(amount));
                break;
            case 'addMateria':
                readline.question('Введите количество материи для добавления: ', (amount) => addMateria(amount));
                break;
            case 'display':
                displayData();
                break;
            case 'craft':
                    readline.question('Введите название предмета для крафта: ', (recipeName) => craftItem(recipeName));
                    break;
            case 'exit':
                readline.close();
                break;
            default:
                console.log('Неизвестная команда.');
        }
    });
    
    readline.on('close', () => {
        console.log('Программа завершена.');
        process.exit(0);
    });
}

change()