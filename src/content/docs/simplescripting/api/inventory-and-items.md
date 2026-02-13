---
title: Inventory & Items
description: Create and inspect ItemStacks today, and track planned inventory management surfaces.
---

:::note[Available now]
The `inventory` global provides ItemStack creation and utilities, plus the `ItemStackHandle` wrapper for items and `ItemContainerHandle` wrapper for managing inventories and containers.
:::

:::caution[Planned for future release]
Advanced inventory management (`InventoryHandle` with section access and smart operations) is planned for a future update.
:::

## Inventory API (`inventory`)

### API

- `inventory.createStack(itemId)` → `ItemStackHandle`
- `inventory.createStack(itemId, quantity)` → `ItemStackHandle`
- `inventory.createStack({ itemId, quantity?, durability?, maxDurability?, metadata? })` → `ItemStackHandle`
- `inventory.emptyStack()` → `ItemStackHandle`
- `inventory.isEmpty(stack)` → boolean
- `inventory.areStackable(a, b)` → boolean
- `inventory.areSameType(a, b)` → boolean

### Example

```javascript
var pickaxe = inventory.createStack({
  itemId: "IronPickaxe",
  quantity: 1,
  durability: 150,
  maxDurability: 250,
  metadata: { enchanted: true, level: 3 }
});

console.info(pickaxe.itemId, pickaxe.durability + "/" + pickaxe.maxDurability);
```

## ItemStack (`ItemStackHandle`)

### Properties

- `itemId`
- `quantity`
- `durability`
- `maxDurability`
- `broken`
- `unbreakable`
- `empty`
- `valid`
- `blockKey`

### Metadata

- `getMetadata()` → object | null
- `getMetadataValue(key)` → any
- `hasMetadata(key?)` → boolean

### Modification (returns new instances)

- `withQuantity(quantity)` → `ItemStackHandle | null`
- `withDurability(durability)` → `ItemStackHandle`
- `withIncreasedDurability(delta)` → `ItemStackHandle`
- `withMaxDurability(maxDurability)` → `ItemStackHandle`
- `withRestoredDurability(durability)` → `ItemStackHandle`
- `withMetadata(metadata)` → `ItemStackHandle`
- `withMetadata(key, value)` → `ItemStackHandle`

### Convenience

- `damage(amount)` → `ItemStackHandle`
- `repair(amount)` → `ItemStackHandle`
- `fullyRepair()` → `ItemStackHandle`

### Comparison

- `isStackableWith(other)` → boolean
- `isSameItemType(other)` → boolean
- `isEquivalentType(other)` → boolean

### Serialization

- `toObject()` → object
- `toString()` → string

## ItemContainer (`ItemContainerHandle`)

Access containers from players, chests, or block entities:

```javascript
var container = player.getInventory();
var chestContainer = world.getBlockAt(x, y, z).getContainer();
```

### Properties

- `size` - Number of slots in container
- `capacity` - Max items per slot
- `empty` - Is container empty?

### Slot Operations

- `getItem(slot)` → `ItemStackHandle | null` - Get item in specific slot
- `setItem(slot, item)` → `TransactionResultHandle` - Replace item in slot
- `addToSlot(slot, item)` → `TransactionResultHandle` - Add/merge to slot
- `removeFromSlot(slot, quantity)` → `TransactionResultHandle` - Remove quantity from slot
- `clearSlot(slot)` → `TransactionResultHandle` - Clear slot completely

### Container Operations

- `addItem(item)` → `TransactionResultHandle` - Add item to any available slot
- `removeItem(itemId, quantity)` → `TransactionResultHandle` - Remove item from container
- `clear()` → `TransactionResultHandle` - Clear entire container
- `canAddItems(items[])` → boolean - Check if items can fit

### Search & Query

- `count(itemId)` → number - Count matching items
- `findSlot(itemId)` → number | -1 - Find first matching slot
- `findSlots(itemId)` → number[] - Find all matching slots
- `contains(itemId)` → boolean - Check if container has item
- `getQuantity(itemId)` → number - Get total quantity
- `has(itemId, quantity)` → boolean - Check if has enough
- `containsStackable(item)` → boolean - Check if can stack

### Iteration

- `forEach(callback)` - Iterate all items: `(item, slot) => {}`
- `map(callback)` - Map items to array: `(item, slot) => value`
- `filter(callback)` - Filter items: `(item, slot) => boolean`
- `getAll()` → `ItemStackHandle[]` - Get all items as array
- `getAllSlots()` → object[] - Get all slots (including empty)

### Example

```javascript
// Get player inventory
var inv = player.getInventory();

// Add items
var stone = inventory.createStack('Stone', 64);
var result = inv.addItem(stone);
if (result.success) {
    console.info('Added stone, remainder:', result.remainder ? result.remainder.quantity : 0);
}

// Search for items
var diamondSlot = inv.findSlot('Diamond');
if (diamondSlot >= 0) {
    var diamond = inv.getItem(diamondSlot);
    console.info('Found', diamond.quantity, 'diamonds in slot', diamondSlot);
}

// Iterate and filter
var valuable = inv.filter(function(item) {
    return item.itemId.includes('Diamond') || item.itemId.includes('Gold');
});
console.info('Found', valuable.length, 'valuable items');
```

## TransactionResult (`TransactionResultHandle`)

All container operations return transaction results:

### Properties

- `success` - Operation succeeded?
- `message` - Optional error/info message
- `remainder` - Remaining items that didn't fit
- `slotBefore` - Item/items before operation
- `slotAfter` - Item/items after operation
- `slot` - Affected slot number

### Example

```javascript
var result = container.addItem(stone);
if (!result.success) {
    console.warn('Failed:', result.message);
} else if (result.remainder) {
    console.info('Added but', result.remainder.quantity, 'items remain');
}
```

## Entity Inventory Access

```javascript
// Access player inventory (returns ItemContainerHandle)
var playerInv = player.getInventory();

// Access living entity inventory (future)
var entityInv = entity.getInventory();
```

## Planned: Advanced Inventory

### InventoryHandle

- Section access: hotbar, storage, armor, utility, tools, backpack
- Active slot management for hotbar, tools, and utility
- Smart operations: `smartMoveItem`, `quickStack`, `takeAll`, `putAll`
- High-level helpers: `giveItem`, `takeItem`, `hasItem`, `getItemQuantity`
