let playerName = prompt('Palun sisesta oma nimi.');

class Typer{
    constructor(name){
        this.name = name;
        this.wordsInGame = 2;
        this.startingWordLength = 2;
        this.words = [];
        this.typeWords = [];
        this.wordsTyped = 0;
        this.startTime = 0;
        this.endTime = 0;
        this.results = [];
        this.word;
        this.loadFromFile();
    }

    loadFromFile(){
        $.get('database.txt', (data) => {
            let content = JSON.parse(data).content;
            console.log(data);
            localStorage.setItem('score', JSON.stringify(content));
            console.log(localStorage.getItem('score'));
            this.init();
        }).done();
        
    }

    init(){
        $.get("lemmad2013.txt", (data)=>this.getWords(data));
        $('#show-results').on('click', ()=>{this.showResults();});
        if(localStorage.getItem('score')){
            this.results = JSON.parse(localStorage.getItem('score'));
        } else{
            console.log('Else see')
        }
    }

    startTyper(){
        this.generateWords();
        this.startTime = performance.now();
        $(document).on('keypress', (event)=>this.shortenWord(event.key));
    }

    shortenWord(keypressed){
        if(this.word.length > 1 && this.word.charAt(0) == keypressed){
            console.log(keypressed);
            this.word = this.word.slice(1);
            this.drawWord();
        } else if(this.word.length == 1 && this.word.charAt(0) == keypressed && this.wordsTyped != this.wordsInGame - 1){
            this.wordsTyped++;
            this.selectWord();
        } else if(this.word.length == 1 && this.word.charAt(0) == keypressed && this.wordsTyped == this.wordsInGame - 1){
            console.log('viimane sümbol');
            this.endTime = performance.now();
            $('#score').html(this.name + " sinu aeg oli " + ((this.endTime-this.startTime)/1000).toFixed(2));
            this.saveResult();
            this.wordsTyped++;
            this.showInfo();
            $('#wordDiv').html("Uue mängu alustmaiseks, vajuta enter");
            $(document).off('keypress');
            $(document).on('keypress', (event)=>this.startGameWithEnter(event.keyCode));
        }
    }

    startGameWithEnter(keyPressed){
        console.log(keyPressed);
        if(keyPressed === 13){
            location.reload();
        }
    }

    saveResult(){
        let result = {
            name: this.name,
            time: ((this.endTime-this.startTime)/1000).toFixed(2)
        }

        this.results.push(result);
        this.results.sort((a, b) => parseFloat(a.time) - parseFloat(b.time));
        localStorage.setItem('score', JSON.stringify(this.results));

        $.post('server.php', {save: this.results}).done(function(){
            console.log('Success');
        }).fail(function(){
            alert('FAIL');
        }
        ).always(function(){
            console.log("Tegime midagi AJAXiga");
        });
    }

    generateWords(){
        for(let i = 0; i < this.wordsInGame; i++){
            const wordLength = this.startingWordLength + i;
            const randomWord = Math.round(Math.random() * this.words[wordLength].length);
            this.typeWords[i] = this.words[wordLength][randomWord];
        }

        console.log(this.typeWords);

        this.selectWord();
    }

    selectWord(){
        this.word = this.typeWords[this.wordsTyped];
        this.drawWord();
    }

    drawWord(){
        $('#wordDiv').html(this.word);
        this.showInfo();
    }

    getWords(data){
        const dataFromFile = data.split('\n');
        console.log(dataFromFile);
        this.separeteWordsByLength(dataFromFile);
    }

    separeteWordsByLength(data){
        for(let i = 0; i < data.length; i++){
            const wordLength = data[i].length;

            if(this.words[wordLength] === undefined){
                this.words[wordLength] = [];
            }

            this.words[wordLength].push(data[i]);
        }
        console.log(this.words);

        this.startTyper();
    }

    showResults(){
        $('#results').fadeToggle();
        console.log("showResults väärtused",this.results);
        $('#results').html("");
        for(let i = 0; i < this.results.length; i++){            
            if(i === 10){break;}
            $('#results').append((i+1) + ". " + this.results[i].name + " " + this.results[i].time + "<br>");
        }
    }

    showInfo(){
        $('#info').html(this.wordsTyped + "/" + this.wordsInGame);
    }
}

let typer = new Typer(playerName);