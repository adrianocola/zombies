//types lists:
//  -tiles
//  -buildings
//  -itens

var World = {
    topLeft: [Number], //point
    bottomRight: [Number] //point
}

var Region = {
    topLeft: [Number], //point
    bottomRight: [Number], //point
    lastActivation: Date
}

/**
 * Buildings spawn new items after 24hrs from the last search
 * Buildings spawn less items if they are searched by multiple people
 * When generating new items, decrease searchCount by X and reset players list
 */
var Building = {
    name: String,
    type: Number,
    maxHp: Number,
    hp: Number,
    height: Number,
    lastActivation: Date, //the last time new items where generated for this building
    lastSearch: Date, //when was the last time someone searched this building
    searchCount: Number, //increased every time someone searches this building
    items: [Item], //itens generated when searching
    players: [Player] //players that searched this building in the last 24hrs
}

var Tile = {
    pos: [Number], //point
    type: Number,
    face: Number, // 0=UP, 1=RIGHT, 2=BOTTOM, 3=LEFT
    building: Building,
    slots: [{
        thing: Thing,
        pos: Number
    }],
    lastActivation: Date,
    noise: Number //absolute number indicating noise level
}

var Thing = {
    pos: [Number], //point
    slot: Number
}

var Zombie = _.extend(Thing,{
    lastActivation: Date,
    maxHp: Number,
    hp: Number,
    activated: Boolean,
    target: [Number] //point
})

var Player = _.extend(Thing,{
    lastActivation: Date,
    name: String,
    user: User,
    maxHp: Number,
    hp: Number,
    energy: Number,
    carrying: Item,
    inventory: {
        item: Item
    },
    stats: {
        str: Number,
        dex: Number,
        int: Number
    },
    searchedBuildings: [{
        building: Building,
        time: Date
    }]
})

var Item = _.extend(Thing,{
    type: Number,
    hp: Number,
    data: {} //anything
})

var User = {
    email: String,
    password: String
}