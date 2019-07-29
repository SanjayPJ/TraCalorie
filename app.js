// storage controller
const StorageController = (() => {
	return {
		storeItem: function(item){
			let items = [];
			if(localStorage.getItem('items') == null){
				items = [];

				items.push(item);
			}else{
				items = JSON.parse(localStorage.getItem('items'));
				items.push(item);
			}

			localStorage.setItem('items', JSON.stringify(items));
		},

		getItemFromStorage : function(){
			let items = [];
			if(localStorage.getItem('items') == null){
				items = [];
			}else{
				items = JSON.parse(localStorage.getItem('items'));
			}

			return items;
		},

		updateItems: function(items){
			localStorage.setItem('items', JSON.stringify(items));
		},

		clearItemsFromStorage(){
			localStorage.removeItem('items');
		}
	}
})();

// item controller
const ItemsController = (() => {
	const Item = function(id, name, calories) {
		this.id = id;
		this.name = name;
		this.calories = calories;
	}

	const data = {
		item: StorageController.getItemFromStorage(),
		currentItem: null,
	}

	return {
		getItem(){
			return data.item;
		},

		logData(){
			return data;
		},

		addItem(name, calories){
			let id;
			if(data.item.length > 0){
				id = data.item[data.item.length - 1].id + 1;
			}else{
				id = 0;
			}

			let new_calories = parseInt(calories);
			newItem  = new Item(id, name, new_calories);

			data.item.push(newItem);

			return newItem;

		},

		getTotalCalories(){
			let totalCalories = 0;
			data.item.map(item => {
				totalCalories += item.calories
			})
			return totalCalories;
		},

		getItemById(id){
			let found = null;
			data.item.map(item => {
				if(item.id == id){
					found = item;
				}
			})

			return found;
		},

		setCurrentItem(item){
			data.item.currentItem = item;
		},

		getCurrentItem(){
			return data.item.currentItem;
		},

		updateCurrentItem(meal, calories){
			currentItem = ItemsController.getCurrentItem();

			parsed_cal = parseInt(calories);

			data.item.map(item => {
				if(item.id == currentItem.id){
					item.name = meal;
					item.calories = parsed_cal;
				}
			})
		},

		deleteItem(){
			currentItem = ItemsController.getCurrentItem();

			data.item = data.item.filter(item => {
				return currentItem.id != item.id;
			});

		},

		setItemsEmpty(){
			data.item = [];
		}
	}
})();

// UI controller
const UIController = (() => {
	const collection = document.getElementById('collection');
	const addButton = document.getElementById('addButton');
	const clearAllButton = document.getElementById('clear-all');
	const updateButton = document.getElementById('updateButton');
	const deleteButton = document.getElementById('deleteButton');
	const backButton = document.getElementById('backButton');
	const mealInput = document.getElementById('meal');
	const caloriesInput = document.getElementById('calories');
	const totalCaloriesSpan = document.getElementById('total-calories');


	return {
		populateItemList(items){
			let itemList = ``;
			items.map(item => {
				itemList += `<li id="item-${item.id}" class="collection-item"><div><b>${item.name}: </b>${item.calories} calories<a href="#!" class="secondary-content"><i class="material-icons blue-text">edit</i></a></div></li>`;
			})
			collection.innerHTML = itemList;
		},

		addItemList(item){
			const itemList = `<li id="item-${item.id}" class="collection-item"><div><b>${item.name}: </b>${item.calories} calories<a href="#!" class="secondary-content"><i class="material-icons blue-text">edit</i></a></div></li>`;
			collection.innerHTML += itemList;
		},

		getButton(){
			return {
				addButton: addButton,
				updateButton: updateButton,
				deleteButton: deleteButton,
				backButton: backButton,
				clearAllButton: clearAllButton
			};
		},

		getInput(){
			return {
				meal: mealInput,
				calories: caloriesInput,
			}
		},

		clearInput(){
			mealInput.value = '';
			caloriesInput.value = '';
		},

		showTotalCalories(calories){
			totalCaloriesSpan.textContent = calories;
		},

		clearEditState(){
			UIController.clearInput();
			updateButton.style.display = 'none';
			deleteButton.style.display = 'none';
			backButton.style.display = 'none';
		},

		addItemToForm(item){
			currentItem = ItemsController.getCurrentItem();
			mealInput.value = currentItem.name;
			caloriesInput.value = currentItem.calories;
		},

		showEditState(){
			updateButton.style.display = 'inline-block';
			deleteButton.style.display = 'inline-block';
			backButton.style.display = 'inline-block';
			addButton.style.display = 'none';
		},

		clearAll(){
			collection.innerHTML = '';
		}
	}
})();

// App controller
const App = ((ItemsController, UIController) => {
	const addEventListeners = function(){
		const { addButton, updateButton, deleteButton, backButton, clearAllButton } = UIController.getButton();
		let { meal, calories } = UIController.getInput();
		
		addButton.addEventListener('click', function(e){
			console.log('Add Button Clicked...');

			if(meal.value !== '' && calories.value !== ''){
				const newItem = ItemsController.addItem(meal.value, calories.value);
				UIController.addItemList(newItem);
				StorageController.storeItem(newItem);

				let totalCalories = ItemsController.getTotalCalories();
				UIController.showTotalCalories(totalCalories);

				UIController.clearInput();
			}
			e.preventDefault();
		})	

		collection.addEventListener('click', function(e){
			console.log('Edit Button clicked...');

			if(e.target.textContent == 'edit'){
				const listId = e.target.parentNode.parentNode.parentNode.id;
				const listIdArr = listId.split('-');
				const id = parseInt(listIdArr[1]);

				let item = ItemsController.getItemById(id);

				ItemsController.setCurrentItem(item);
				UIController.addItemToForm(); 
				UIController.showEditState();
			}
			e.preventDefault();
		});

		updateButton.addEventListener('click', function(e){
			console.log('Update Button Clicked...');

			ItemsController.updateCurrentItem(meal.value, calories.value);

			const items = ItemsController.getItem();
			UIController.populateItemList(items);

			StorageController.updateItems(items);

			let totalCalories = ItemsController.getTotalCalories();
			UIController.showTotalCalories(totalCalories);

			e.preventDefault();
		});

		backButton.addEventListener('click', function(e){
			console.log('Back Button Clicked...');

			UIController.clearEditState();
		});

		deleteButton.addEventListener('click', function(e){
			console.log('Delete Button Clicked ...');

			ItemsController.deleteItem();

			const items = ItemsController.getItem();
			UIController.populateItemList(items);
			UIController.clearInput();

			StorageController.updateItems(items);

			let totalCalories = ItemsController.getTotalCalories();
			UIController.showTotalCalories(totalCalories);

			e.preventDefault();
		});

		clearAllButton.addEventListener('click', function(e){
			console.log('Clear All Button Clicked ...');

			UIController.clearAll();
			ItemsController.setItemsEmpty();
			StorageController.clearItemsFromStorage();

			let totalCalories = ItemsController.getTotalCalories();
			UIController.showTotalCalories(totalCalories);

			e.preventDefault();
		})
	}
	return {
		init: function(){
			console.log('Initializing App...');
			UIController.clearEditState();

			const items = ItemsController.getItem();
			UIController.populateItemList(items);

			let totalCalories = ItemsController.getTotalCalories();
			UIController.showTotalCalories(totalCalories);

			addEventListeners();
		},
	}
})(ItemsController, UIController);

//Initialize App
App.init();