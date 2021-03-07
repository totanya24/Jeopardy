// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]


// let category = result.category;
// console.log('category',category);
const num_categories = 6;
const num_clues_per_cat = 5;

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */
let categories = [];

async function getCategoryIds() {
    const result = await axios.get('http://jservice.io/api/categories?count=100');
    // console.log('getCategoryIds', result);

    let categories = result.data.map(result => result.id);
    // let catg = result.data
    //console.log("categories",categories);
    return _.sampleSize(categories, num_categories)

}

// const categories = getCategoryIds()
// console.log("categories", categories)
/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    const url = `http://jservice.io/api/category?id=${catId}`
   // console.log(url)
    const res = await axios.get(url)
    //console.log('res', res)
    const category = res.data;
    const allClues = category.clues;
    const randClues = _.sampleSize(allClues, num_clues_per_cat)


    // id: clues.id,
    //     title: clues.title,
    //     clues: clues.clues
    const clues = randClues.map(categoryId => ({
        answer: categoryId.answer,
        question: categoryId.question
    }))
   // console.log('clues', clues)
    // fillTable(clues)
    return {title: category.title, clues}
}

//const clues = getCategory(5412)
/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

function fillTable() {

    $("#table thead ").empty();
    let $tr = $("<tr>");

    for (let catIdx = 0; catIdx < num_categories; catIdx++) {
        // console.log('categories[catIdx]', catIdx)
        // console.log('categories[catIdx].title', catIdx.title)
        $tr.append($("<th>").text(categories[catIdx].title));
    }
    $("#table thead").append($tr);


    // Add rows with questions for each category
    $("#table tbody").empty();
    for (let clueIdx = 0; clueIdx < num_clues_per_cat; clueIdx++) {
        let $tr = $("<tr>");
        for (let catIdx = 0; catIdx < num_categories; catIdx++) {
            $tr.append($("<td>").attr("id", `${catIdx}-${clueIdx}`).text("?"));
        }
        $("#table tbody").append($tr);
    }
}


/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    let id = evt.target.id;
    let [catId, clueId] = id.split("-");

    //console.log("handleclick", catId, categories[catId])

    let clue = categories[catId].clues[clueId];
    //console.log('clueId', clueId, 'catId', catId, clue );


    let message;
    console.log('clue before', clue);
    if (!clue.showing) {
        message = clue.question;
        clue.showing = "question";
    } else if (clue.showing === "question") {
        message = clue.answer;
        clue.showing = null
    }
    console.log('clue after', clue);
    $(`#${catId}-${clueId}`).html(message);
};

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {

}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {

    let catIds = await getCategoryIds();

    categories = [];

    for (let catId of catIds) {
        categories.push(await getCategory(catId));
    }
  //  console.log('before filltable categories', categories)
    fillTable();
}

/** On click of start / restart button, set up game. */

// TODO

$("#restart").on("click", async function () {
    $("#table").off("click", "td", handleClick);
    setupAndStart();
    $("#table").on("click", "td", handleClick);
});

/** On page load, add event handler for clicking clues */

// TODO