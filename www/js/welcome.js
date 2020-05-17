
class Welcome extends Page {
    
    /**
     * Page that greets people when they aren't logged in or log out.
     * It is simple: contains a login and signup button
     * 
     * @param {Integer} id - page id
     * @param {PageTransition} pageTransObj - copy of controlling PageTransition object
     */
    constructor(id, pageTransObj) {
        super(id, "Welcome");
        
        // Sync so that when the buttons are pressed, stuff happens
        this.transitionObj = pageTransObj;
        
    }
    
    getHtml() {
        return (`
            <div id="welcomePage" class="div_page">
                <br><br>
                <img src="img/logo.png" alt="Sportwatch Logo" style="width: 40%;">
                <br>
                <h1 style="font-size: 4em">Sportwatch</h1>
                <br><br>
                <div class="selection">
                    <button id='signup' class='sw_big_button' type='button'>Sign Up</button>
                    <button id='login' class='sw_big_button' type='button'>Login</button>
                </div>
            </div>
        `);
        // TODO: Implement guest login, possibly
    }
    
    start() {
        // Very similar to main.js's defineSwipes
        console.log("Sarting welcome.js");
        $("#welcomePage").find("#signup").bind("touchend", (e) => {
            e.preventDefault();
            this.transitionObj.slideRight("signupPage", 200);
        });

        $("#welcomePage").find("#login").bind("touchend", (e) => {
            e.preventDefault();
            this.transitionObj.slideLeft("loginPage", 200);
        });
    }
    
    stop() {
        
        // Clear click hanlders to prevent duplicate event firing
        // $("#welcomePage").find("#signup").off();
        // $("#welcomePage").find("#login").off()
    }
    
}

