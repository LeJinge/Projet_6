document.addEventListener("DOMContentLoaded", function() {

    // Déclarations
    const modal = document.getElementById("myModal");
    const closeButton = document.querySelector(".close");
    const carousels = document.querySelectorAll('.carousel-wrapper');

    // Fonctions associées aux boutons précédent et suivant des carrousels
    carousels.forEach(carousel => {
        const movies = carousel.querySelector('.carousel-movies');
        const nextBtn = carousel.querySelector('.next');
        const prevBtn = carousel.querySelector('.prev');

        nextBtn.addEventListener('click', function() {
            movies.scrollBy({ left: 150, behavior: 'smooth' });
        });

        prevBtn.addEventListener('click', function() {
            movies.scrollBy({ left: -150, behavior: 'smooth' });
        });
    });

    async function fetchMovies(url, displayFunction) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des films.");
            }
            const data = await response.json();
            displayFunction(data);
        } catch (error) {
            console.error("Erreur : ", error);
        }
    }

    function displayBestMovie(data) {
        const bestMovieCarousel = document.querySelector('.best-movie-content');
        const movie = data.results[0];
        bestMovieCarousel.innerHTML = `
            <div class="movie-card" data-movie-id="${movie.id}">
                <img src="${movie.image_url}" alt="${movie.title}">
                <h3>${movie.title}</h3>
                <p>Score IMDb: ${movie.imdb_score}</p>
            </div>`;
    }

    function displayMoviesForBestRanking(data, carouselSelector) {
        const filteredData = { ...data, results: data.results.slice(1) };
        displayMoviesInCarousel(filteredData, carouselSelector);
    }


    function displayMoviesInCarousel(data, carouselSelector) {
        const carouselElement = document.querySelector(carouselSelector);
        const moviesContainer = carouselElement.querySelector('.carousel-movies-container') || carouselElement; // Si .carousel-movies-container n'existe pas, utilisez l'élément carrousel lui-même
        const htmlContent = data.results.map(movie => `
            <div class="movie-card" data-movie-id="${movie.id}">
                <img src="${movie.image_url}" alt="${movie.title}">
                <h3>${movie.title}</h3>
                <p>Score IMDb: ${movie.imdb_score}</p>
            </div>
        `).join('');
        moviesContainer.innerHTML = htmlContent;
    }


    // Fonction pour ouvrir le modal
    function openModal(movie) {
        modal.innerHTML = `
          <div class="modal-content">
              <img id="modalImage" src="${movie.image_url}" alt="${movie.title}">
              <div class="modal-info-section">
                  <h2 id="modalTitle">${movie.title}</h2>
                  <p><strong>Genre:</strong> ${movie.genres.join(', ')}</p>
                  <p><strong>Date de sortie:</strong> ${movie.date_published}</p>
                  <p><strong>Rated:</strong> ${movie.rated}</p>
                  <p><strong>Score IMDb:</strong> ${movie.imdb_score}</p>
                  <p><strong>Réalisateur:</strong> ${movie.directors.join(', ')}</p>
                  <p><strong>Acteurs:</strong> ${movie.actors.join(', ')}</p>
                  <p><strong>Durée:</strong> ${movie.duration} min</p>
                  <p><strong>Pays:</strong> ${movie.countries.join(', ')}</p>
                  <p><strong>Box Office:</strong> ${movie.worldwide_gross_income || 'N/A'}</p>
                  <p id="modalDescription"><strong>Résumé:</strong> ${movie.long_description || movie.description}</p>
              </div>
              <span class="close">&times;</span>
          </div>`;

        modal.querySelector(".close").addEventListener("click", function() {
            modal.style.display = "none";
        });

        modal.style.display = "block";
    }

    document.addEventListener("click", function(event) {
        let targetElement = event.target;
        while (targetElement != null) {
            if (targetElement.classList.contains("movie-card")) {
                const movieId = targetElement.dataset.movieId;
                fetch(`http://localhost:8000/api/v1/titles/${movieId}`)
                    .then(response => response.json())
                    .then(movie => {
                        openModal(movie);
                    })
                    .catch(error => {
                        console.error("Erreur lors de la récupération des détails du film:", error);
                    });
                return;
            }
            targetElement = targetElement.parentElement;
        }
    });

    closeButton.addEventListener("click", function() {
        modal.style.display = "none";
    });

    window.addEventListener("click", function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });

    // Initialisation
    fetchMovies("http://localhost:8000/api/v1/titles/?sort_by=-imdb_score&limit=1", displayBestMovie);
    fetchMovies("http://localhost:8000/api/v1/titles/?sort_by=-imdb_score&page_size=8", data => displayMoviesForBestRanking(data, '.best-ranking .carousel-movies'));
    fetchMovies("http://localhost:8000/api/v1/titles/?sort_by=-imdb_score&page_size=7&genre=Comedy", data => displayMoviesInCarousel(data, '.category-1 .carousel-movies'));
    fetchMovies("http://localhost:8000/api/v1/titles/?sort_by=-imdb_score&page_size=7&genre=Family", data => displayMoviesInCarousel(data, '.category-2 .carousel-movies'));
    fetchMovies("http://localhost:8000/api/v1/titles/?sort_by=-imdb_score&page_size=7&genre=Romance", data => displayMoviesInCarousel(data, '.category-3 .carousel-movies'));

});
