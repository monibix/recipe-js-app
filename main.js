const mealsEl = document.getElementById('meals')
const favoriteContainer = document.getElementById('fav-meals')

const searchTerm = document.getElementById('search-term')
const searchBtn = document.getElementById('search-btn')

const mealPopup = document.getElementById('meal-popup')
const mealInfoEl = document.getElementById('meal-info')
const popupCloseBtn = document.getElementById('close-pop')

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/random.php')
        //.then(resp => resp.json())
    const respData = await resp.json();
    const randomMeal = respData.meals[0];
    addMeal(randomMeal, true)
}

async function getMealById(id) {    
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i='+id)
    const respData = await resp.json();
    const mealById = respData.meals[0];
    return mealById
}

async function getMealsBySearch(term) {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s='+term)
    const respData = await resp.json()
    const meals = await respData.meals
    //console.log("searchFetch", meals)
    return meals
}

function addMeal(mealData, random = false) {
    const meal = document.createElement('div');
    meal.classList.add('meal')
    meal.innerHTML = `
        <div class="meal-header">
            ${random ? `<span class="random">Random Recipe</span>` : ''}
             
                <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
            
        </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class="fav-btn">
                <i class="fas fa-heart"> </i>
            </button>
        </div>
    `

    const btn = meal.querySelector('.meal-body .fav-btn')
    btn.addEventListener('click', ()=>{
        if (btn.classList.contains("active")) {
            removeMealFromLS(mealData.idMeal)
            btn.classList.remove('active')
        } else {
            addMealToLS(mealData.idMeal)
            btn.classList.add('active')
        }
        //btn.classList.toggle('active')
        fetchFavMeals()
    })

    meal.addEventListener('click', () => {
        showMealInfo(mealData)
    })

    mealsEl.appendChild(meal)
}

function addMealToLS(mealId) {
    const mealsId = getMealsFromLS();

    localStorage.setItem('mealIds', JSON.stringify([...mealsId, mealId]))
}

function removeMealFromLS(mealId) {
    const mealsIds = getMealsFromLS() 

    localStorage.setItem('mealIds', JSON.stringify(mealsIds.filter((id)=> 
        id !== mealId
    )));
}

function getMealsFromLS() {
    const mealsId = JSON.parse(localStorage.getItem('mealIds'))
    return mealsId === null ? [] : mealsId
}

async function fetchFavMeals() {
    //clean fav-container 
    favoriteContainer.innerHTML = ''; 

    const mealIds = getMealsFromLS()
    console.log("MEALIDS", mealIds)
    //const meals = [];

    for (let i=0; i<mealIds.length;i++) {
        const mealId =  mealIds[i]
        meal = await getMealById(mealId)
        //meals.push(meal)
        addMealToFav(meal)

    }

    console.log("MEALS", mealIds)

}

function addMealToFav(mealData) {

    const favMeal = document.createElement('li')

    favMeal.innerHTML = `
        
            <img class="fav-img" src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
            <span>${mealData.strMeal}</span>
            <button class="clear"><i class="fas fa-window-close"></i></button>    
    `
    const btn = favMeal.querySelector(".clear")
    btn.addEventListener('click', ()=> {
        removeMealFromLS(mealData.idMeal)
        fetchFavMeals();
    })
    
    favMeal.addEventListener('click', () => {
        showMealInfo(mealData)
    })

    favoriteContainer.appendChild(favMeal)
}

function showMealInfo(mealData) {
    //clean DOM
    mealInfoEl.innerHTML = "";
    //update meal info
    const mealEl = document.createElement('div')
    //get ingriedients and measures
    console.log("mealData", mealData)
    const ingredients = []
    for (let i=1; i<=20; i++) {
        if (mealData['strIngredient'+1]) {
            ingredients.push(`${mealData["strIngredient"+i]} - ${mealData["strMeasure"+i]} `)
        } else {
            break;
        }
    }
    console.log(ingredients)
    mealEl.innerHTML = `
        <h1>${mealData.strMeal}</h1>
        <img src="${mealData.strMealThumb}" alt="">
        <p>${mealData.strInstructions}</p>   
        <h3>Ingredients</h3>
        <ul>
            ${ingredients.map((ing)=>`
                <li>${ing}</li>
            `).join("")}
        </ul>
    `
    mealInfoEl.appendChild(mealEl)
    //show popup
    mealPopup.classList.remove('hidden')
}

searchBtn.addEventListener('click', async () => {
    mealsEl.innerHTML = ""
    const search = searchTerm.value
    const meals = await getMealsBySearch(search)
    
    if (meals) {
        meals.forEach(meal => {
            addMeal(meal)
        })
    } else {
        const meal = document.createElement('div');
        meal.classList.add('meal')
        meal.innerHTML = "No meals found"
        meal.style.padding = '2rem 1rem'
        mealsEl.appendChild(meal)
    }
})

popupCloseBtn.addEventListener('click', () => {
    mealPopup.classList.add('hidden')

})