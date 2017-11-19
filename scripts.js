const app = {};

app.key = '12c98fa8845c6c9678471fabe9bb1643';
app.baseUrl = 'https://api.themoviedb.org/3';

app.requestData = {
    genreID: null,
    minRating: null,
    maxRating: null,
    movieID: null,
};

app.randomInArray = (arr) => {
    const randomNumber = Math.floor(Math.random() * arr.length);
    return arr[randomNumber];
}

app.getMovieData = (genreID, minRating, maxRating) => {
    $.ajax({
        url: `${app.baseUrl}/discover/movie`,
        method: 'GET',
        dataType: 'json',
        data: {
            api_key: app.key,
            sort_by: 'vote_average.asc',
            certification_country: 'US',
            'certification.lte': 'PG-13', // to prevent return of adult movies
            'vote_count.gte': 10,// to avoid completely obscure films
            with_genres: genreID,
            'vote_average.lte': maxRating,
            'vote_average.gte': minRating,
        },
    }).then(res => {
        app.MovieInfo = res.results;
        const randomMovie = app.randomInArray(app.MovieInfo);
        $('.movieTitle').text(`${randomMovie.title}`);
        
        if (randomMovie.overview === "") {
            $('.movieOverview').text('No description.');
        } else {
            // if the length of the description is greater than 280 characters, only get the first 280 and add elipses on the end
            if (randomMovie.overview.length > 280) {
                randomMovie.overview = randomMovie.overview.slice(0, 280).concat('...');
            }
            $('.movieOverview').text(`${randomMovie.overview}`);
        }

        $('.moviePoster').attr('src', `https://image.tmdb.org/t/p/w500/${randomMovie.poster_path}`);
        app.movieID = randomMovie.id;
        app.getMovieTrailer(app.movieID);
    })
};

app.genreSelector = () => {
    const genre = $('#genres').val();
    $.ajax({
        url: `${app.baseUrl}/genre/movie/list`,
        method: 'GET',
        dataType: 'json',
        data: {
            api_key: app.key,
        }
    }).then(genreData => {
        // receive an object containing the data but you only want the genres property
        // therefore, re-assign the object to equal the genres property, which is an array of genres with a genre id and genre name
        genreData = genreData.genres;
        // run through the genreData array containing genre objects and check if the property of name matches the genre value from the input, if so, return the value of the property id
        for (let i = 0; i < genreData.length; i++) {
            if (genreData[i].name === genre) {
                app.requestData.genreID = genreData[i].id;
            }
        }
    })
};

app.getRating = () => {
    // the value of the checked radio button is used to get the corresponding max and min rating within an array to be used as a query string in the ajax request
    // each radio button has a value corresponding to its n-th-of-type and since indices begin at 0, the index will be -1 of its value
    const rating = $(`input[type='radio']:checked`).val();
    let ratingRanges = [
        {max: 6, min: 4},
        {max: 3.99, min: 2.501},
        {max: 2.5, min: 1.00},
    ];
    app.requestData.minRating = ratingRanges[rating-1].min;
    app.requestData.maxRating = ratingRanges[rating-1].max;
};

app.ratingDisplay = () => {
    $('.rating').on('click', function() {
        // remove the class of checked from following ratings
        $('.ratingSelector > li ~ li').removeClass('checked');
        // add class of checked to previous ratings
        for (let i = $(this).find(':radio').val(); i >=1; i--) {
            $(`.rating:nth-of-type(${i})`).addClass('checked');
        }
    })
};

// using the movie ID retrieved as randomMovie.id, an object containing a key related to a youtube link is returned
app.getMovieTrailer = (movieID) => {
    $.ajax({
        url: `${app.baseUrl}/movie/${movieID}/videos`,
        method: 'GET',
        dataType: 'json',
        data: {
            api_key: app.key
        }
    }).then(res => {
        // if the movie has a trailer the array will not be empty, so in this case get the link key and insert it into the source of the iframe then show the iframe
        // add the flickity class so the user can then click the arrow to watch the trailer
        if (res.results.length > 0) {
            res = res.results[0].key; // res = end of youtube link
            $('.results').flickity({

            });
            $('#ytPlayer').attr('src', `https://www.youtube.com/embed/${res}`).show('slow', 'linear');
        } else {
            $('#ytPlayer').attr('src', '').hide('slow', 'linear');
        }
    })
}

app.getMovie = () => {
    $('form').on('submit', e => {
        e.preventDefault();
        app.genreSelector();
        app.getRating();
        app.getMovieData(app.requestData.genreID, app.requestData.minRating, app.requestData.maxRating);
    })
}

// INTERACTIVE FUNCTIONS (i.e. on click, submits, changes)
app.events = function(){
    app.getMovie();
    app.ratingDisplay();
};

app.init = function(){
    app.events();
};


$(app.init);