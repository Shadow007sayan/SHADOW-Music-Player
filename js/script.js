console.log("Lets Write JavaScript");
let songs;
let allSongsName;
let currFolder;
// fetch from api

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/`)
    let response = await a.text(); // here without await promise pending
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = Array.from(div.getElementsByTagName("a"));
    let songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/songs/${folder}`)[1]);  //  songs.push(element.href.split("/songs/")[1])  to push only names ******
        }

    }   
    console.log(songs);
    return songs;
}

// ---------------------- done by me ----------------


async function getSongNameOnly(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/`)
    let response = await a.text(); // here without await promise pending

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = Array.from(div.getElementsByTagName("a"));
    console.log(as)

    allSongsName = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        console.log(element.href.split("/").slice(-1)[0].replace(/%20/g, ' '));
        if (element.href.endsWith(".mp3"))
            allSongsName.push(element.href.split("/").slice(-1)[0].replace(/%20/g, ' '));

    }
    console.log(allSongsName)

    // after getting all song show all songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];    // selected to insert <li></li> inside this selected  ul

    // reset songUL everytime playlist click so previous song removed and new song added . if we dont the n everytime it gets appended

    songUL.innerHTML = "";

    for (const s of allSongsName) {
        songUL.innerHTML = songUL.innerHTML + `<li> 
                                 <img src="assets/images/music.svg" alt="">
                                 <div class="info">
                                     <div>${s}</div>
                                     <div>Shadow</div>
                                 </div>
                                 <div class="playnow">
                                     <span>Play Now</span>
                                     <img  class="invert" src="assets/images/play.svg" alt="">
                                 </div>
                             </li>`
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {

        e.addEventListener("click", () => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML.trim());
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })


    })
}

let currentSong = new Audio();

//playmusic fn
const playMusic = (track, pause = false) => {
    // var audio = new Audio("/songs/" + track);
    currentSong.src = `/songs/${currFolder}/` + track;
    console.log(currentSong.src)

    if (!pause) {          // this condition is done for starting starting purpose so that at starting music name and 00 time displayed but no song play
        currentSong.play();
        play.src = "assets/images/pause.svg"
    }


    document.querySelector(".songinfo").innerHTML = track  //  if i havenot done my own fn for getting music name only then the name might come as encode url %20 ...%20 like that then we have to use decodeURI(track) in place of track
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"


}

function convertSecondsToMinuteSecond(seconds) {
    const totalSeconds = Math.floor(seconds); // Ensure seconds are an integer
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    const formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
    return `${minutes}:${formattedSeconds}`;
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text(); // here without await promise pending
    let div = document.createElement("div");
    div.innerHTML = response;
    // console.log(response)
    let anchors = Array.from(div.getElementsByTagName("a"))
    console.log(anchors)

    for (let index = 0; index < anchors.length; index++) {
        const e = anchors[index];
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0]
            console.log(folder)
            //Get the metadata of the folder
            let b = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response = await b.json();
            console.log(response)
            document.querySelector(".cardContainer").innerHTML = document.querySelector(".cardContainer").innerHTML + ` <div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40"
                                color="#000000" fill="none">
                                <!-- Larger Circular Background -->
                                <circle cx="20" cy="20" r="19" fill="rgb(10,230,50)" />

                                <!-- Larger Triangle (Play Button) Centered -->
                                <path d="M14 10L28 20L14 30V10Z" fill="black" />
                            </svg>
                        </div>
                        <img src="songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            // console.log(`${item.currentTarget.dataset.folder}`)
            await getSongNameOnly(`${item.currentTarget.dataset.folder}`)
            
            // whenever a card is clicked 1st song played
            playMusic(allSongsName[0])
        })
    })
}

async function main() {


    //      Get list of all the songs
    songs = await getSongs("test");

    await getSongNameOnly("test")
    
    playMusic(allSongsName[0], true);

    // Display all albums on the page
    displayAlbums()

    // //    Play the First song
    // var audio = new Audio(songs[0]);
    // // audio.play();

    // audio.addEventListener("loadeddata", () => {
    //     console.log(audio.duration, audio.currentSrc, audio.currentTime);
    //})



    // Attach an event listener to play, previous and next song 
    //  we can directly select id here ids are previous, play, next in HTML

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "assets/images/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "assets/images/play.svg"
        }
    })

    // used for not showing at starting few millisec to show currentSong.duration
    currentSong.addEventListener("loadedmetadata", () => {
        document.querySelector(".songtime").innerHTML = `${convertSecondsToMinuteSecond(currentSong.currentTime)} / ${convertSecondsToMinuteSecond(currentSong.duration)}`;
    });
    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${convertSecondsToMinuteSecond(currentSong.currentTime)} / ${convertSecondsToMinuteSecond(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //add event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width);
        document.querySelector(".circle").style.left = percent * 100 + "%";

        // update music time acc to seekbar
        currentSong.currentTime = percent * currentSong.duration;


    })

    // Add event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    // Add event listener for close left
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
    })

    //Add event listener to previous and next . as previous & next is id we can directly select

    //code done by me and idea from harry bhai  
    previous.addEventListener("click", () => {
        console.log("Previous clicked")
        // console.log(currentSong.src.split("/"))
        console.log(currentSong.src.split("/")[5].replace(/%20/g, ' '))
        let index = allSongsName.indexOf(currentSong.src.split("/")[5].replace(/%20/g, ' '));
        index = (index - 1 + allSongsName.length) % allSongsName.length;
        playMusic(allSongsName[index])
    })

    next.addEventListener("click", () => {
        console.log("Next clicked")
        console.log(currentSong.src.split("/")[5].replace(/%20/g, ' '))
        let index = allSongsName.indexOf(currentSong.src.split("/")[5].replace(/%20/g, ' '));
        index = (index + 1) % allSongsName.length;
        playMusic(allSongsName[index])
    })

    // Add an event to volume

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to ", e.target.value, " / 100");
        currentSong.volume = e.target.value / 100;
    })


    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click",e=>{
        if(e.target.src.includes("assets/images/volume.svg")){
            // = use because strings are immutable
            e.target.src = e.target.src.replace("assets/images/volume.svg","assets/images/mute.svg")
            currentSong.volume=0
            document.querySelector(".range").getElementsByTagName("input")[0].value=0;
        }
        else{
            e.target.src = e.target.src.replace("assets/images/mute.svg","assets/images/volume.svg")
            currentSong.volume=.2
            document.querySelector(".range").getElementsByTagName("input")[0].value=20;
        }
    })

}

main()

//  replace port 5500 by 5500