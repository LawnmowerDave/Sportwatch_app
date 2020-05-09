class App {

    constructor() {
        this.pages = [];
        this.currentPageID = 0;
        this.navbar = new Navbar();
        this.transitionObj = new PageTransition();
        this.swipeHandler;
    }

    initialize(params) {
        // bind sets the value of 'this' inside the function to this object
        document.addEventListener('deviceready', this.onReady.bind(this), false);
        document.addEventListener('pause', this.onPause.bind(this), false);
        document.addEventListener('resume', this.onResume.bind(this), false);
    }

    onReady() {
        console.log("DEVICE READY");
        sw_db.init();
        FastClick.attach(document.body);

        $(".loader").remove();

        $(document).click(function (event) {
            var text = $(event.target).text();
            console.log("CLICK " + text);
        });

        this.navbar.initNavbar(this.switchPage.bind(this));
        this.swipeHandler = new SwipeHolder("#app"); // Has to be after onReady
        $("#app").empty();
        this.constructPages();
        this.initializeFirstPage();

    }

    /**
     * @description This will set the first page. It must be called before switching to another may happen.
     */
    initializeFirstPage() {
        this.setCurrentPageID(0);
        this.startCurrentPage();
        this.defineSwipes(0);
    }

    /**
     * @description This is called whenever the user switches to a new page and will receive
     * the name of of it in the "page" argument.
     * 
     * @param {string} pageName 
     */
    switchPage(pageName) {
        console.log(`switching to ${pageName}`);
        this.transitionPage(pageName);
        this.stopPreviousPage();
        this.setCurrentPageID(this.getPage(pageName).id);
        this.startCurrentPage();
    }

    /**
     * @description Handle any transition display while moving from one page to another. 
     * @param {String} pageName name of the page to transition to
     */
    transitionPage(pageName) {

        this.navbar.focusButton("#" + pageName.toLowerCase());
        if (this.getPage(pageName).id > this.currentPageID) {
            this.transitionObj.slideLeft(pageName.toLowerCase() + "Page", 200);
        } else if (this.getPage(pageName).id < this.currentPageID) {
            this.transitionObj.slideRight(pageName.toLowerCase() + "Page", 200);
        } else {
            console.log("[main.js:transitionPage()]: Tried to switch page! Page ID is already current!!");
        }
        this.defineSwipes(this.getPage(pageName).id);

    }

    /**
     * @description create a new object for each page and populate the array.
     * 
     * @param {String} pageName The name of the page
     * 
     */
    constructPages(pageName) {
        $("#app").html(""); // Clear app html
        this.pages = [Stopwatch, Stats, Team, Account].map((page, i) => new page(i));
        this.pages.forEach((pageObj, pageIndex) => {
            let shouldShow = false; // Should be page be visible at start? (only for first page)
            if (pageIndex == 0) {
                shouldShow = true;
            }
            this.transitionObj.addPage((pageObj.name.toLowerCase() + "Page"), pageObj.getHtml(), shouldShow);
        });
    }

    checkSession() {
        // // check if there's a session
        // if(Authentication.hasSession()) {
        //     Authentication.validateSID(Authentication.getSID()).then(function(response) {
        //         console.log("Login complete");
        //         StateManager.setState("home");
        //     }).catch(function(error) {
        //         // they have most likely have an invalid SID, so just wipe it and log them back in
        //         console.log("invalid sid: " + Authentication.getSID());
        //         localStorage.removeItem("SID");
        //         StateManager.setState("login");
        //     });
        // } else {
        // }
    }

    /**
     * check to make sure a few js things are avaliable
     */
    checkRequirements() {
    }


    /**
     * Returns a page by passing in an integer id or string name
     * 
     * @throws an exception if the parameter is not an integer or string
     * 
     * @param {Number | String} identifier 
     */
    getPage(identifier) {
        if (typeof identifier == "string") {
            for (let i = 0; i < this.pages.length; i++) {
                if (this.pages[i].name == identifier) {
                    return this.pages[i];
                }
            }

            throw new Error(`Could not find ${identifier} inside of pages`);
        } else if (typeof identifier == "number" && Number.isInteger(identifier)) {
            for (let i = 0; i < this.pages.length; i++) {
                if (this.pages[i].id == identifier) {
                    return this.pages[i];
                }
            }

            throw new Error(`Could not find ${identifier} inside of pages`);
        } else {
            throw new Error(`Incorrect datatype entered for getPage, expected integer or string, you entered ${typeof identifier}`);
        }
    }

    /**
     * Defines the swipeHandler actions for this page (left, right, moving)
     * 
     * @example this.defineSwipes(this.getPage(nextPage).id); --> sets up handlers for new / next page
     * 
     * @param {Ingeger} pageIndex the numerical index corresponding to pages Map object
     */
    defineSwipes(pageIndex) {

        // Going left (swiping right)
        if (pageIndex > 0) {
            this.swipeHandler.bindGestureCallback(this.swipeHandler.Gestures.SWIPERIGHT, () => {
                this.switchPage(this.getPage(pageIndex - 1).name);
            });
        } else {
            // Blank since 0 is left-most page
            this.swipeHandler.bindGestureCallback(this.swipeHandler.Gestures.SWIPERIGHT, () => { });
        }

        // Going right (swiping left)
        if (pageIndex < this.pages.length) {
            this.swipeHandler.bindGestureCallback(this.swipeHandler.Gestures.SWIPELEFT, () => {
                this.switchPage(this.getPage(pageIndex + 1).name);
            });
        } else {
            this.swipeHandler.bindGestureCallback(this.swipeHandler.Gestures.SWIPELEFT, () => { });
        }

        // Moving (Left / Right)
        // dx > 0 ==> Swiping right to left,   dx < 0 ==> Left to right
        this.swipeHandler.bindGestureCallback(this.swipeHandler.Gestures.MOVE, (dx, dy) => {
            if ((dx > 0) && (pageIndex < this.pages.length - 1)) {
                this.transitionObj.slidePageX(this.getPage(pageIndex + 1).name.toLowerCase() + "Page", true, Math.abs(dx));
            } else if ((dx < 0) && (pageIndex > 0)) {
                this.transitionObj.slidePageX(this.getPage(pageIndex - 1).name.toLowerCase() + "Page", false, Math.abs(dx));
            } else {
                // this.transitionObj.slidePageX(this.getPage(pageIndex).name.toLowerCase() + "Page", true, 0);
            }
        });

    }

    setCurrentPageID(id) {
        this.currentPageID = id;
    }

    /**
     * @description invoke the start() method on the current page
     */
    startCurrentPage() {
        this.pages[this.currentPageID].start();
    }

    /**
     * @description invoke the stop() method on the previous page, provided this is called before updating the pageID
     */
    stopPreviousPage() {
        this.pages[this.currentPageID].stop();
    }

    onPause() {
        console.log("Device is paused");
    }

    onResume() {
        console.log("Device is resumed");
    }
}

// this is the main entry point for the app
let app = new App();
app.initialize();
