///// + INITIAL /////
///// + LOGIN /////
///// + DEMO /////
///// + START WORK /////
///// + NAVIGATION  /////
///// + BUYER. START /////
///// + MANUFACTURER. START /////
///// + MANAGE WORKSPACE /////
///// + MANAGE PRODUCTS ////
///// + CREATE ORDER ////
///// + MANAGE ORDER ////
///// + MANAGE DELIVERY ////
///// + MANAGE CLAIMS ////
///// + MANAGE PROJECTS ////
///// + MANAGE CHATS ////
///// + MANAGE ANALYTICS ////
///// + MANAGE FILES ////
///// + MANAGE PROFILE ////
///// + MANAGE TICKETS ////
///// + MANAGE PLANNING ////
///// + MANAGE PRICING ////
///// + MANAGE EXCHANGE RATES ////
///// + CREATE PRODUCT ////
///// + MANAGE UPDATER ////
///// + MANAGE USERS ////
///// + MANAGE ACCESS ////
///// + MANAGE CREDIT ////
///// + MANAGE MANUFACTURER REGIONS ////
///// + MANAGE FINANCIAL INFO ////


import autosize from '../nodemodules/autosize/src/autosize.js';

import Tagify from '../nodemodules/@yaireo/tagify/dist/tagify.min.js'
import Dropmic from '../libs/dropmic/dropmic.js'



document.addEventListener('DOMContentLoaded', function(){

    let cookie_cart_name = "cookie_cart";
    let cookie_cart = getCookie(cookie_cart_name);
    let cookie_name_token = "spg_token";
    let cookie_name_permanent_token = "spg_permanent_token";
    let cookie_token = getCookie(cookie_name_token);
    let cookie_permanent_token = getCookie(cookie_name_permanent_token);
    let cookie_name_analytic = "analytic";
    let cookie_name_workspace = "workspace";

    let cookie_country = "user_country";
    let cookie_manufacturer_products = "cookie_manufacturer_products";

    let country_ip = ''
    var api_url = "http://localhost:3000/";
    let work_mode = 'dev'
    if (window.location.href.includes("yourpartners")) {
        work_mode = 'prod'
    }
    if (work_mode == 'prod') {
        api_url = "https://yp-api.herokuapp.com/"
    }
    api_url = "https://yp-api.herokuapp.com/"



    const industries = ["JAM", "CONFECTION", "BAKERY", "DAIRY", "YOGHURT", "BEVARAGE", "PHARMA", "OTHER"]
    let buyer_manufacturer = null

    let main_data = {}
    let buyer = {}
    let user = {}
    let incoterms = []

    let products_data = [];
    let cart         = [];
    let cart_results = [];
    let user_status = '';
    let user_regions = '';
    let user_customers = '';
    let user_products = '';


    let tag_listener = false




    ///// + INITIAL /////

    ifLogin();
    function ifLogin()     {
        document.querySelectorAll(".containers").forEach(obj=>obj.classList.remove("visible"));

        if (typeof cookie_permanent_token !== 'undefined' && cookie_permanent_token !== 'undefined') {
            loginWithToken()
        } else {

            $('.load_container') .hide();
            $('.login_container').show();
            $('#container_email').show();
            $('#container_password').hide();
            $('#container_access').hide();
            $('#container_2nd').hide();
            $('#login_info').text("LOGIN TO YOUR ACCOUNT");
            $('.client_container') .hide();
            document.querySelectorAll(".containers").forEach(obj=>obj.classList.remove("visible"));
            document.getElementsByClassName("login_container")[0].classList.add("visible");

            if (window.location.href.includes("login")) {
                let login = window.location.href.split("login=")[1]
                document.getElementById('login_email').value = login
            }
        }
    }

    function loginWithToken(){
        sendRequest('post', 'login_with_token', {password: $('#login_password').val()})
            .then(data => {
                if (data.error){
                    exitService()
                } else {
                    if (data.demo){
                        start()
                    } else {
                        document.getElementById('login_email').value = data.email

                        $('.load_container') .hide();
                        document.getElementsByClassName("login_container")[0].classList.add("visible");
                        document.getElementById('div_login_btns_selector').style.display = 'none'
                        document.getElementById('div_login').style.display = 'block'

                        $('#login_info').text("Open Authy and approve login");
                        $('#container_email').hide();
                        $('#container_password').hide();
                        $('#container_access').hide();
                        $('#container_2nd').show();
                        $('#login_2nd_timer').show();
                        $('#login_2nd_resend').hide();
                        timer_login_seconds = 60
                        waitingLoginApprove()
                        $('#btn_login_sms_send').text("Send SMS to " + data.phone);
                    }
                }
            })
            .catch(err => console.log(err))
    }

    function start(){
        document.getElementsByClassName("login_container")[0].classList.remove("visible");

        $('#div_chat').draggable()
        $('#div_planning_details_table').draggable()

        startLoader()
        fetch(
            `${api_url}get_user_status`,
            { method: 'GET',
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }})
            .then( response => {
                console.log("get_user_status ", response.status)
                if (response.status === 401) {
                    exitService()
                }
                return response.json()
            } )
            .then( json => {
                if (!json.approved) {
                    document.getElementsByClassName("load_container")[0].style.display = 'none'
                    return
                }


                user_regions   = json.regions
                customers_filter.regions = json.regions

                user_customers = json.customers
                user_products  = json.products
                user_status = json.status
                setLogo(json.logo)
                getMainInfo(json.status)
            })
            .catch( error => {
                console.log("error ", error)
                //TODO
                exitService()
            }  );

    }

    let loader_interval  = null
    let loader_increment = 0
    function startLoader() {
        let load_container = document.getElementById('load_container')
        load_container.style.display = 'flex'

        const messages = ["Desktop is prepared...",
            "Loading orders...",
            "Deliveries loaded...",
            "Analytics prepared...",
            "Chats updated..."]


        let load_text = document.getElementById('load_text')



        loader_interval = setInterval(() => {
            load_text.innerText = messages[loader_increment]
            load_text.style.color = '#8d93ab'

            if (loader_increment + 1 == messages.length){
                loader_increment = 0
            } else {
                loader_increment += 1
            }
        }, 1000)
    }
    function finishLoader() {
        clearInterval(loader_interval)

        let load_left = document.getElementById('load_left')
        let load_right = document.getElementById('load_right')
        load_left.classList.remove('animate__fadeInLeftBig')
        load_right.classList.remove('animate__fadeInRightBig')
        load_left.classList.add('animate__fadeOutLeft')
        load_right.classList.add('animate__fadeOutRight')

        let load_container = document.getElementById('load_container')
        load_container.classList.add('animate__fadeOut')
    }

    getCountryIP()

    ///// -INITIAL /////









    ///// + LOGIN /////

    document.getElementById('btn_play_video_presentation').onclick = function() {
        document.getElementById('div_login_btns_selector').style.display = 'none'

        document.getElementById('div_video_presentation').style.display = 'block'
        document.getElementById('div_video_presentation_langs').style.display = 'flex'
        document.getElementById('video_presentation_header').innerText = 'SELECT LANGUAGE'

    }
    Array.from(document.querySelectorAll(".div_video_presentation_lang")).forEach(function(element) {
        element.addEventListener('click', openVideoPresentation );
    })
    function openVideoPresentation(){
        document.getElementById('div_video_presentation').style.display = 'none'
        let iframe = document.getElementById('video_presentation_iframe')
        iframe.style.display = 'block'


        let video_link = this.getAttribute("data-link")
        let youtube_player;



        function onYouTubeIframeAPIReady() {
            // showAlert("onYouTubeIframeAPIReady")

            let width = window.screen.width > 900 ? 552 : window.screen.width * 0.84
            let height = width * 0.78

            youtube_player = new YT.Player('video_presentation_iframe', {
                height: height,
                width: width,
                videoId: video_link,
                playerVars: {
                    'playsinline': 1
                },
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
        }

        function onPlayerStateChange(event) {
            if(event.data == 0){
                console.log("FInish video")
                // document.getElementById('div_video_presentation').style.display = 'block'
                document.getElementById('video_presentation_iframe').style.display = 'none'

                document.getElementById('div_login_btns_selector').style.display = 'flex'

                document.getElementById('div_video_presentation_langs').style.display = 'none'
                document.getElementById('video_presentation_header').innerText = 'WATCH AND TRY'

                youtube_player.destroy()
                // showCongratsPage('Presentation is over', 'as is your pain from working with other CRM systems')
            }
        }
        function onPlayerReady(event) {
            event.target.playVideo();
        }


        onYouTubeIframeAPIReady()

    }

    document.getElementById('btn_get_login').onclick = function() {
        document.getElementById('div_login_btns_selector').style.display = 'none'
        document.getElementById('div_login').style.display = 'block'
    }
    $("#login_email").on('keyup', function (e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            $('#login_btn_email').click();
        }
    });
    $('#login_btn_email').click(function () {

        sendRequest("post", "login_email", {email: $('#login_email').val()})
            .then(data => {
                if (data.user_present){
                    $('#container_email').hide();
                    $('#container_password').show();
                    $('#login_password').focus();
                    $('.login_btn_forget').hide()
                    $('#div_video_presentation').hide()
                    $('#video_presentation_iframe').hide()

                    if (data.password_present){
                        $('#login_info').text("Password");
                        $('.login_btn_forget').show()
                    } else {
                        $('#login_info').text("Create your password");
                        $('#div_password_repeat').show()
                    }

                } else {
                    showAlert("Check your email")
                }
            })
            .catch(err => console.log(err))
    })

    $('#login_password_show').click(function () {
        let password_input = $('#login_password')[0]
        if (this.src.includes('show.svg')) {
            this.src = 'img/hide.svg'
            password_input.type = 'text'
        } else {
            this.src = 'img/show.svg'
            password_input.type = 'password'
        }
    })
    $('#login_password_2_show').click(function () {
        let password_input = $('#login_password_2')[0]
        if (this.src.includes('show.svg')) {
            this.src = 'img/hide.svg'
            password_input.type = 'text'
        } else {
            this.src = 'img/show.svg'
            password_input.type = 'password'
        }
    })
    $('.login_btn_forget').click(function () {
        $('#login_info').text("Set your new password.\nIt will be approved after confirmation in the next step.");
        $('#div_password_repeat').show()
        $('.login_btn_forget').hide()
        $('#login_password').val("")

        sendRequest("post", "clean_password", {email: $('#login_email').val()})
            .then(data => {})
            .catch(err => console.log(err))
    })


    $("#login_password, #login_password_2").on('keyup', function (e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            $('#login_btn_password').click();
        }
    });
    $('#login_btn_password').click(function () {
        if ($('#div_password_repeat').is(":visible") == true) {

            if ($('#login_password').val() !== $('#login_password_2').val()) {
                showAlert("Password mismatch. Please repeat")
                return
            }
        }

        sendRequest("post", "login_password", {email: $('#login_email').val(), password: $('#login_password').val()})
            .then(data => {
                if (data.auth_token != "") {
                    saveLoginToken(data.auth_token)

                    //window.location.reload();
                    start()
                    return
                }

                if (data.password_coincided){
                    $('#login_info').text("Open Authy and approve login");
                    $('#container_password').hide();
                    $('#container_2nd').show();
                    $('#login_2nd_timer').show();
                    $('#login_2nd_resend').hide();
                    timer_login_seconds = 60
                    waitingLoginApprove()
                    $('#btn_login_sms_send').text("Send SMS to " + data.phone);

                    if (data.authy_register) {
                        $('#btn_download_authy').hide();
                    }
                } else {
                    showAlert("Check your password")
                }
            })
            .catch(err => console.log(err))
    })
    $('#login_2nd_resend').click(function () {
        $('#login_btn_password').click();
    })

    $('#btn_download_authy').click(function () {
        $('#btn_download_authy').hide()
        $('#div_authy_apps').show()

        $('#login_2nd_timer').hide();
        $('#login_2nd_resend').show();
        clearInterval(timer_login_approve)
    })
    let timer_login_seconds = 60
    let timer_login_approve = null
    function waitingLoginApprove() {

        timer_login_approve = setInterval(() => {

            sendRequest("post", "check_login_approve", {email: $('#login_email').val(),
                code: $('.login_sms').val()})
                .then(data => {
                    if (data.login_approve){
                        clearInterval(timer_login_approve)
                        saveLoginToken(data.token)
                        savePermanentToken(data.permanent_token)


                        document.querySelectorAll(".containers").forEach(obj=>obj.classList.remove("visible"));

                        start()
                    }
                })
                .catch(err => console.log(err))

            timer_login_seconds -= 1
            if (timer_login_seconds <= 0){
                clearInterval(timer_login_approve)
                $('#login_2nd_timer').hide();
                $('#login_2nd_resend').show();
            } else {
                $('#login_2nd_timer').text(timer_login_seconds);
            }
        }, 1000);
    }

    $('#btn_login_sms_send').click(function () {
        $('#btn_login_sms_send').hide()
        $('#login_sms_token').show()
        $('#login_sms_token').focus()
        $('#btn_login_sms_approve').show()
        clearInterval(timer_login_approve)
        $('#login_2nd_timer').hide();

        sendRequest("post", "send_login_sms", {email: $('#login_email').val()})
            .then(data => {
            })
            .catch(err => console.log(err))
    })
    $('#btn_login_sms_approve').click(function () {
        $('#btn_login_sms_send').hide()
        $('#login_sms_token').show()
        $('#login_sms_token').focus()
        $('#btn_login_sms_approve').show()

        sendRequest("post", "check_login_sms", {email: $('#login_email').val(), sms_token: $('#login_sms_token').val()})
            .then(data => {
                if (data.auth_token != "") {
                    saveLoginToken(data.auth_token)
                    window.location.reload();
                    return
                } else {
                    showAlert("Incorrect code from SMS")
                }
            })
            .catch(err => console.log(err))
    })




    document.getElementById('login_register_btn').addEventListener('click', () => {
        //showPopup("register_request")
        $('#login_info').text("REQUEST ACCESS");
        $('#container_access').show();
        $('#container_email').hide();

    })
    document.getElementById('btn_register').addEventListener('click', () => {
        let data = {organization_name:   document.getElementById('register_company_name').value,
            organization_country:        document.getElementById('register_company_country').value,
            organization_website:           document.getElementById('register_company_site').value,
            organization_email:          document.getElementById('register_email').value,
            contact_person: document.getElementById('register_contact_person').value,
            contact_phone:  document.getElementById('register_contact_phone').value,
            contact_email:  document.getElementById('register_contact_email').value,
            contact_position:  document.getElementById('register_contact_position').value,
            organization_type: document.getElementById('btn_register').getAttribute("data-organization-type")
        }


        if (data.organization_name === '' || data.organization_country === '' || data.organization_website === '' ||
            data.organization_email === '' ||
            data.contact_person === '' || data.contact_email === ''|| data.contact_position === ''|| data.contact_position === ''  )  {
            showAlert("Fill in all fields")
            return
        }

        sendRequest('POST', 'register_new', data)
            .then(data => {
                if (data.error === 0) {
                    setCookie(cookie_name_token, data.token,   3600);
                    console.log("setCookie ", data.token)
                    window.location.reload();
                } else if (data.error === 1)  {
                    showAlert("Such mail already exists")
                } else if (data.error === 2)  {
                    showAlert("Such organization already registered")
                }
            })
            .catch(err => console.log(err))
    })
    document.getElementById('btn_register_request').addEventListener('click', () => {
        let data = {
            email:   document.getElementById('register_request_email').value,
            comment: document.getElementById('register_request_comment').value,
        }

        if (data.email == "") {
            showAlert("Fill in all fields")
            return
        }

        sendRequest('POST', 'register_request', data)
            .then(data => {
                document.getElementById('register_request_email').value = ""
                document.getElementById('register_request_comment').value = ""

                $('#container_access').hide();
                $('#container_email').show();

                $('#login_info').text("LOGIN TO YOUR ACCOUNT");
                showAlert("Your request has been sent")
            })
            .catch(err => console.log(err))
    })

    ///// - LOGIN /////









    ///// + DEMO /////

    document.getElementById('btn_get_demo').onclick = function() {
        showPopup("get_demo")
    }
    document.getElementById('btn_create_demo').onclick = function() {

        let body = {
            company: document.getElementById('get_demo_company').value,
            country: document.getElementById('get_demo_country').value,
            name:    document.getElementById('get_demo_name').value,
            email:   document.getElementById('get_demo_email').value,
            phone:   document.getElementById('get_demo_phone').value,
        }
        if (body.company == '' || body.name == '' || body.email == '' || body.country == ''  ) {
            showAlert("Fill all fields")
            return
        }

        closePopup()
        startLoader()
        $('.load_container') .show();
        document.getElementsByClassName("login_container")[0].classList.remove("visible");

        sendRequest('post', 'create_demo_accounts', body)
            .then(data => {
                saveLoginToken(data.auth_token)
                savePermanentToken(data.auth_token)
                window.location.reload()
            })
            .catch(err => console.log(err))
    }
    Array.from(document.querySelectorAll(".left-menu-changer")).forEach(function(element) {
        element.addEventListener('click', changeDemoAccount )
    })
    function changeDemoAccount() {
        startLoader()
        stopUpdater()
        $('.load_container') .show();
        document.getElementsByClassName("manufacturer_container")[0].classList.remove("visible");
        document.getElementsByClassName("client_container")[0].classList.remove("visible");


        sendRequest('post', 'change_demo_account', {})
            .then(data => {

                document.getElementById("login_email").value      = data.login
                document.getElementById("login_password").value   = data.password
                document.getElementById("login_password_2").value = data.password
                $('#login_btn_password').click()

            })
            .catch(err => console.log(err))
    }

    ///// - DEMO /////








    ///// + START WORK /////

    createDatePickers()
    function getMainInfo(status){
        switch (status){
            case 'admin':
                startAdmin()
                break;
            case 'buyer':
                startBuyer()
                break;
            case 'manufacturer':
                startManufacturer()
                break;
        }

        Array.from(document.getElementById("page_orders").getElementsByClassName('orders_list')).forEach(function(element) {
            element.style.display = 'none'
        });
        Array.from(document.getElementById("page_manufacturer_orders").getElementsByClassName('orders_list')).forEach(function(element) {
            element.style.display = 'none'
        });

    }

    function setLogo(logo){
        if (logo != null) {
            Array.from(document.querySelectorAll(".company_logo")).forEach(function(element) {
                element.src = logo
            })
        }
    }

    let our_products
    let products_short = []

    function setUserInfo(user){
        Array.from(document.getElementsByClassName("user_name")).forEach(function(element) {
            element.innerText = user.name + " " + user.surname
            //element.innerText = "User name"
        });
        Array.from(document.getElementsByClassName("user_position")).forEach(function(element) {
            element.innerText = user.position
            //element.innerText = "User position"
        });

        if (user.avatar !== '' && typeof user.avatar !== 'undefined') {
            Array.from(document.getElementsByClassName("avatar")).forEach(function(element) {
                if (user.avatar.length > 25){
                    element.src = user.avatar
                } else {
                    element.src = `img/avatars/${user.avatar}.png?v2`
                }
                // element.src = `img/avatars/base_avatar.png?v2`

            })
        }
    }
    ///// -START WORK /////







    ///// + NAVIGATION  /////

    Array.from(document.getElementsByClassName("btn_left_navigation_open")).forEach(function(element) {
        element.addEventListener('click', openLeftNav);
    })
    function openLeftNav() {
        const left_menu = this.parentElement.parentElement.querySelector(".left_menu")
        left_menu.style.left = "0px";

        this.parentElement.parentElement.querySelector(".main_back").style.display = 'block'
    }

    Array.from(document.getElementsByClassName("left_menu_close")).forEach(function(element) {
        element.addEventListener('click', closeLeftNav);
    })
    Array.from(document.getElementsByClassName("main_back")).forEach(function(element) {
        element.addEventListener('click', closeLeftNav);
    })
    function closeLeftNav() {
        const left_menu = this.parentElement.parentElement.querySelector(".left_menu")
        left_menu.style.left = "-320px";

        this.parentElement.parentElement.querySelector(".main_back").style.display = 'none'
    }



    Array.from(document.getElementsByClassName("nav_bottom")).forEach(function(element) {
        element.addEventListener('click', clickNavBottom);
    });
    function clickNavBottom(){

        Array.from(document.getElementsByClassName("nav_bottom")).forEach(function(element) {
            element.classList.remove("active")
            element.querySelector("img").src = `img/nav/no_active/${getIconName(element)}.svg`
        })

        this.classList.add("active")
        this.querySelector("img").src = `img/nav/active/${getIconName(this)}.svg`

        changeAppHeader(this.querySelector(".nav_bottom_text").innerText)
        changeCurrentPage(this.getAttribute("data-page"))
        window.scrollTo(0,0)

        function getIconName(element){
            return element.getAttribute("data-page").split("_")[element.getAttribute("data-page").split("_").length - 1]
        }
    }



    Array.from(document.getElementsByClassName("left-menu-client")).forEach(function(element) {
        let btns = element.getElementsByClassName('div_user_profile_btns')[0]
        let info = element.getElementsByClassName('user_info')[0]
        element.addEventListener("mouseenter", (e) => {
            btns.style.display = 'flex'
            info.style.display = 'none'
        });
        element.addEventListener("mouseleave", (e) => {
            btns.style.display = 'none'
            info.style.display = 'block'
        });
    });
    Array.from(document.querySelectorAll(".navigation")).forEach(function(element) {
        element.addEventListener('click', changePage );
    });
    function changePage(){
        changeCurrentPage(this.getAttribute("data-page"))
        window.scrollTo(0,0)
    }
    function changeCurrentPage(new_page){
        console.log("new page ", new_page)

        showTopIcons(new_page)

        if (new_page === "calculate"){
            Array.from(document.querySelectorAll(".btns-calculation")).forEach(function(element) {
                element.classList.remove("active")
                order_conditions.supply   = ""
                order_conditions.incoterm = ""
                order_conditions.prepay   = ""
                order_conditions.delay    = ""
            });
        }


        let display_cart = 'none'
        if (new_page === "products" || new_page === "manufacturer_order_products" ) {
            if (main_data.accesses.products_manage) {
                display_cart = 'block'
            }
        }
        if (main_data.accesses.products_manage) {
            Array.from(document.getElementsByClassName("cart_container")).forEach(function(element) {
                // element.style.display = display_cart
            })
        }





        let error = false
        if (new_page === "calculate" && cart.length === 0) {
            error = true
            showAlert("To go to calculation options, place your order")
            changeCurrentPage("work_space")
        }
        //if (new_page === "orders" && main_data.ordered_products.length === 0) {
        //
        //    if (main_data.ordered_products.length === 0 && main_data.supplies.length === 0){
        //        error = true
        //        showAlert("To go to orders page, you need at least 1 placed order")
        //
        //        Array.from(document.getElementsByClassName(".cart_with_products")).forEach(function(element) {
        //            element.style.display = 'block'
        //        });
        //        //document.getElementById(`cart_with_products`).style.display =  'block'
        //    }
        //
        //
        //}


        if (["manufacturer_chats", "chats"].includes(new_page)) {
            document.querySelector(`[data-page="manufacturer_chats"]`).innerHTML = "CHATS"
            document.querySelector(`[data-page="chats"]`).innerHTML = "CHATS"
        }

        if (!error) {
            Array.from(document.querySelectorAll(".pages")).forEach(function(element) {
                element.style.display = 'none'
            });
            document.getElementById(`page_${new_page}`).style.display = 'flex'

            if (new_page != 'calculate' && new_page != 'project' && new_page != 'manufacturer_order_products' && new_page != 'manufacturer_project' && new_page != 'manufacturer_buyer' ) {
                Array.from(document.querySelectorAll(".left-menu-nav-item")).forEach(function(element) {
                    element.classList.remove('active')
                });
                document.querySelectorAll(`.navigation[data-page=${new_page}]`)[0].parentElement.classList.add('active')

            }

            window.scrollTo(0, 0)
        }

        //if (main_data.user.fin_iban === '') {
        //    showAlert("Please fill all fields before continue")
        //    document.querySelectorAll('[data-page=manufacturer_cab_fin]')[0].click()
        //}
    }

    function showTopIcons(new_page){

        Array.from(document.getElementsByClassName("top_right_icon")).forEach(function(element) {
            element.style.display = 'none'
        });

        let visible_icons = []
        if (new_page == "products"){
            visible_icons.push("icon_cart_top")
        }


        visible_icons.forEach((i) => {
            Array.from(document.getElementsByClassName(i)).forEach(function(element) {
                element.style.display = 'block'
            });
        })
    }


    function changeAppHeader(header_name){
        Array.from(document.getElementsByClassName("top_header")).forEach(function(element) {
            element.innerText = header_name
        })
    }

    Array.from(document.querySelectorAll(".div_updates .wrapper_update")).forEach(function(element) {
        element.addEventListener('click', clickWorkSpaceLink );
    })
    function clickWorkSpaceLink(){
        const link_type = this.parentElement.getAttribute("data-type")

        if (user_status == 'manufacturer') {
            if (link_type == 'product') {
                changeCurrentPage('manufacturer_orders')
            } else if (link_type == 'supply') {
                changeCurrentPage('manufacturer_orders')
            } else if (link_type == 'project') {
                changeCurrentPage('manufacturer_projects')
            }
        }


        if (user_status == 'buyer') {
            if (link_type == 'product') {
                changeCurrentPage('orders')
            } else if (link_type == 'supply') {
                changeCurrentPage('orders')
            } else if (link_type == 'project') {
                changeCurrentPage('project')
            }
        }
    }


    Array.from(document.querySelectorAll(".orders_header")).forEach(function(element) {
        element.addEventListener('click', openOrderBlock );


    })
    function openOrderBlock(event){
        //event.preventDefault()
        this.parentElement.parentElement.getElementsByClassName('btn_order_section')[0].click()

    }

    Array.from(document.getElementsByClassName("btn_order_section")).forEach(function(element) {
        //element.setAttribute("data-tippy-content", "Изменить значение")
        element.addEventListener('click', showOrderSection );
    });
    function showOrderSection(){
        const show = this.src.includes("show.svg")
        const parent = this.parentElement.parentElement.parentElement.parentElement

        let list = parent.getElementsByClassName('orders_list')[0]
        let sum = parent.getElementsByClassName('orders_sum')[0]


        if (show){
            if (this.getAttribute("data-type") == 'archive') {
                showPopup("supply_archive_settings")

            } else {
                list.style.display = 'block'
                sum.style.display = 'flex'
            }

        } else {
            list.style.display = 'none'
            sum.style.display = 'none'
        }

        this.src = `img/${show ? 'hide' : 'show'}.svg`

    }


    Array.from(document.getElementsByClassName("update_true")).forEach(function(element) {
        element.addEventListener('click', clickUpdateLink );
    })
    function clickUpdateLink(){
        let link_type = this.parentElement.getAttribute("data-type")

        let page = 'manufacturer_orders'
        if (link_type == 'projects') {
            page = 'manufacturer_projects'
        }
        changeCurrentPage(page)
    }

    ///// - NAVIGATION  /////














    ///// + BUYER. START /////
    function startBuyer(){

        fetch(
            `${api_url}get_buyer_info`,
            { method: 'POST',
                body: JSON.stringify({update_token: true,
                    hour_tail: -1 * (new Date().getTimezoneOffset() / 60)}),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                console.log("main_data:", main_data)

                saveLoginToken(json.auth_token)
                savePermanentToken(json.permanent_token)
                main_data = json
                incoterms = json.incoterms
                buyer = main_data.cabinet_info
                user = json.user
                our_products = main_data.products
                products_short = getProductsList(our_products)
                actual_projects = main_data.projects

                setAvailableCountries(main_data.cabinet_info.countries)
                setAvailableIncoterms(main_data.cabinet_info.incoterms)
                setAvailableCurrencies(main_data.cabinet_info.currencies)
                setAvailablePickupDates()



                document.getElementsByClassName("load_container")[0].style.display = 'none'
                document.getElementsByClassName("client_container")[0].classList.add("visible");
                document.getElementById("page_client_desktop").style.display = 'flex'
                changeCurrentPage("client_desktop")


                setUserInfo(user)


                setBuyerWorkspace()





                setProductsManufacturerFilter()
                setProductsFilters()
                setProductsList(main_data.products, main_data.cabinet_info);
                if (typeof cookie_cart !== 'undefined' && cookie_cart !== 'undefined') {
                    cart = JSON.parse(cookie_cart)
                }
                updateCart(cart)


                autocomplete(document.getElementById("filter_order_invoice_b"), main_data.invoices, true, '');
                autocomplete(document.getElementById("filter_order_product_b"), products_short, true, 'All products');
                document.getElementById('filter_order_product_b').value = 'All products'
                setOrderedProducts(main_data.ordered_products, "buyer")
                setSupplies(main_data.supplies, "buyer")



                autocomplete(document.getElementById("project_create_country"), main_data.countries, true);
                autocomplete(document.getElementById("project_create_type"), ["competitors product replacement", "new product introduction"], true);
                autocomplete(document.getElementById("project_create_manufacturer"), main_data.manufacturers_real.map(m => m.name), true);
                autocomplete(document.getElementById("project_create_product_our"), products_short, false)
                setProjects(actual_projects)







                setManufacturers(main_data.cabinet_info.manufacturers)












                if (main_data.ticket_organizations.length == 0) {
                    document.getElementById("div_ticket_for_whom").style.display = 'none'
                } else {
                    let manufacturers_name = []
                    main_data.ticket_organizations.together.forEach(function(element) {
                        manufacturers_name.push(element.name)
                    });
                    autocomplete(document.getElementById("ticket_create_for_organization"), manufacturers_name, true);
                    document.getElementById("ticket_create_for_organization").onchange = function (){
                        console.log("123")
                        console.log("value ", this.value)

                    }

                    document.getElementById("div_ticket_for_whom").style.display = 'block'
                }


                autocomplete(document.getElementById("ticket_create_type"), ["Product", "Application", "Commercial", "General"], true);
                autocomplete(document.getElementById("ticket_create_product"), products_short, true);
                autocomplete(document.getElementById("ticket_create_industry"), industries, true);

                autocomplete(document.getElementById("ticket_lang_buyer"), main_data.cabinet_info.organization_langs.map((l) => l.lang_name), true, 'English');
                document.getElementById("ticket_lang_buyer").value = main_data.cabinet_info.chat_lang

                updateTickets(true)

                setAccesses()
                setBuyerSettings()
                document.querySelector(`.buyer_info_filters[data-key="price_list"]`).click()


                createBuyerAnalyticFilters()
                setBuyerAnalyticFilters()
                setBuyerAnalytic()
                startUpdater()

                updateNewMessages()

                document.querySelectorAll(`#div_market_digest [data-type="demo"]`)[0].style.display = 'none'
                if (main_data.demo == true){

                    Array.from(document.querySelectorAll(".left-menu-changer")).forEach(function(element) {
                        element.style.display = "flex"
                    })

                    document.querySelectorAll(`.list-manufacturer-user[data-name="DSM"] .manufacturer_img`)[0].src = 'img/logo_test_manufacturer.svg'
                    document.querySelectorAll(`.list-manufacturer-user[data-name="DSM"] .manufacturer_name`)[0].innerText = "Holding"

                    document.querySelectorAll(`.list-manufacturer-user[data-name="Andre Pectin"]`)[0].style.display = 'none'
                    document.querySelectorAll(`.list-manufacturer-user[data-name="DSM Zhongken"]`)[0].style.display = 'none'
                    document.querySelectorAll(`.list-manufacturer-user[data-name="DSM Rainbow"]`)[0].style.display = 'none'
                    document.querySelectorAll(`.list-manufacturer-user[data-name="Demo"]`)[0].style.display = 'flex'

                    document.querySelectorAll(`#div_market_digest [data-type="pectins"]`)[0].style.display = 'none'
                    document.querySelectorAll(`#div_market_digest [data-type="gellans"]`)[0].style.display = 'none'
                    document.querySelectorAll(`#div_market_digest [data-type="demo"]`)[0].style.display = 'block'


                    let html = ''
                    main_data.demo_news.forEach(item => {
                        html += `    <div data-name="demo" class="list-buyer-market" style="flex: 1">
                            <div class="buyer_market_header">
                                <img class="buyer_market_img" src="img/logo_test_manufacturer.svg"/>

                                <div style="width: 100%">
                                    <div class="buyer_market_name">${item.header}</div>
                                    <div class="buyer_market_date">${item.date}</div>
                                </div>
                            </div>
                            <div class="buyer_market_content"> ${item.text}</div>
                        </div>`
                    })
                    document.getElementById("div_market_news").innerHTML = html
                    Array.from(document.getElementsByClassName("list-buyer-market")).forEach(function(element) {
                        element.addEventListener('click', showMarketMoreInfo );
                    })
                }

                tippy('#payment_copy_balance, .products_filter_industry, .container_round_image , .btns_exit, .btns_edit_user, .user_position, #project_company, #btn_create_supply_buyer, #project_desc, #project_base_product, #project_new_product, #project_bulk, .section_new_new, .section_new_person, .section_new_notify', {
                    content: 'My tooltip!',
                    followCursor: 'horizontal',
                    animation: 'fade',
                });
            })
            .catch( error => console.error('error:', error) );
    }

    function setAvailableCountries(countries){

        let html_order  = ''
        countries.forEach((item, i) => {
            html_order += `<div class="order_conditions  selector-product-country" data-value="${item.country_name}">
                                <img src="img/flags/${item.country_code}.svg"/>
                                <div>${item.country_name}</div>
                           </div>`
        })

        document.getElementById('order_countries').innerHTML = html_order
        Array.from(document.querySelectorAll(".selector-product-country")).forEach(function(element) {
            element.addEventListener('click', selectCountry)
        });
    }
    function setAvailableCurrencies(currencies){

        let html_order  = ''
        currencies.forEach((item, i) => {
            html_order  += `<div class="order_conditions  selector-product-currency" data-value="${item}"><div>${item}</div></div>`
        })

        document.getElementById('order_currencies').innerHTML = html_order
        Array.from(document.getElementsByClassName("selector-product-currency")).forEach(function(element) {
            element.addEventListener('click', selectCurrency)
        })


    }
    function setAvailableIncoterms(incoterms){
        let html = ''
        incoterms.forEach((item, i) => {
            html += `<div class="order_conditions  selector-product-incoterm" data-value="${item}"><div>${item}</div></div>`
        })

        document.getElementById('order_incoterms') .innerHTML = html
        Array.from(document.querySelectorAll(".selector-product-incoterm")).forEach(function(element) {
            element.addEventListener('click', selectProductIncoterm)
        })
    }

    function setAvailablePickupDates(){

        let today = new Date();
        let target_date = new Date();

        let monthes = []
        let rows = `<div class="order_conditions  selector-product-pickup" data-value="${null}"><div>ASAP</div></div>`
        for (let i = 1; i <= 9; i++ ) {
            let next_month = moment().add(i, 'months');
            let month = getDateOnlyMonth(next_month)

            if (!monthes.includes(month)) {
                monthes.push(month)
                rows += `<div class="order_conditions  selector-product-pickup" data-value="${next_month}"><div>${month}</div></div>`
            }
        }

        document.getElementById('div_pickup_dates').innerHTML = rows

        //document.querySelectorAll("[data-popup-name=product_pickup]")[0].style.display = 'flex'
        Array.from(document.querySelectorAll(".selector-product-pickup")).forEach(function(element) {
            element.addEventListener('click', selectPickup)
        });
    }

    ///// -BUYER. START /////













    ///// + MANUFACTURER. START /////

    let workspace_data
    let analytic_data
    let actual_projects = []
    let filter_pricing_incoterm = null
    let plan_detail_filter_customers = null
    let plan_detail_filter_raws = null
    let plan_detail_filter_types = null
    let plan_detail_filter_products = null

    function startManufacturer(){

        createWorkspaceFilters(true)

        fetch(
            `${api_url}get_manufacturer_info`,
            { method: 'POST',
                body: JSON.stringify({
                    workspace_filter: workspace_filter,
                    update_token:     true,
                    hour_tail:        -1 * (new Date().getTimezoneOffset() / 60)
                }),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                saveLoginToken(json.auth_token)
                savePermanentToken(json.permanent_token)
                finishLoader()
                document.getElementsByClassName("manufacturer_container")[0].classList.add("animate__fadeIn");
                document.getElementsByClassName("manufacturer_container")[0].classList.add("visible");
                document.getElementById("page_manufacturer_workdesc").style.display = 'flex'

                // document.getElementsByClassName("load_container")[0].style.display = 'none'
                main_data = json
                user = json.user
                setUserInfo(user)
                incoterms = json.incoterms



                let settings_parent_page = document.getElementById("page_manufacturer_settings")

                setLangs("manufacturer", settings_parent_page, main_data.cabinet_info)
                setManufacturerInfo(main_data.manufacturer_info)
                setFinanceInfo("manufacturer", settings_parent_page, main_data.cabinet_info.fin)
                setManufacturerUsers(main_data.manufacturer_users)

                setCountriesForIncoterm(main_data.lists_data.countries)
                setCodesForIncoterm(main_data.lists_data.incoterm_codes)

                setCountriesForRegion(main_data.lists_data.countries)
                setManufacturerRegions(main_data.lists_data.regions_and_countries)

                setPricing(json.products, json.cabinet_info.markups, json.incoterms)

                //let pending_products = json.products.filter(function(item, i) {return item.approved_status === 'pending'})
                //if (json.products.length === 0 || pending_products.length > 0) {
                //    openManufacturerCabinet()
                //    document.querySelectorAll("[data-page=manufacturer_cab_products]")[0].click()
                //    showAlert("Add your products")
                //    return
                //}
                //
                //if (json.cabinet_info.ports.length == 0 ) {
                //    openManufacturerCabinet()
                //    document.querySelectorAll("[data-page=manufacturer_cab_logistic]")[0].click()
                //    showAlert('Select ports of shipment')
                //    return
                //}
                //
                //if (json.cabinet_info.fin.fin_iban === '' ) {
                //    openManufacturerCabinet()
                //    document.querySelectorAll("[data-page=manufacturer_cab_fin]")[0].click()
                //    document.getElementById('btn_manufacturer_edit_fin').click()
                //    showAlert('Provide financial information')
                //    return
                //}


                filter_dd_marketing_reports = new Dropmic(document.getElementById('filter_dd_marketing_reports'));


                // TODO  прописать правильную работу
                //if (main_data.user.name != "Queenie") {
                //    document.querySelector('[data-page="manufacturer_settings"]').style.display = 'none'
                //}


                console.log("manufacturer_info", json)
                workspace_data = json.workspace


                console.log("main_data: ", main_data)


                autocomplete(document.getElementById("filter_order_product_m"), main_data.products.map(product => product.name), true, 'All products');
                autocomplete(document.getElementById("filter_order_company"),   main_data.buyers.map(a => a.name), true, 'All customers');
                autocomplete(document.getElementById("filter_order_invoice_m"), main_data.invoices, true, '');

                document.getElementById('filter_order_product_m').value = 'All products'
                document.getElementById('filter_order_company').value = 'All customers'
                setOrderedProducts(json.ordered_products, "manufacturer")

                document.getElementById('buyers_filter_company').value = 'All customers'
                setBuyersFilterCompanies()

                setSupplies(json.supplies, "manufacturer")

                actual_projects = json.projects
                //autocomplete(document.getElementById("customer_country"), main_data.countries, true);
                //autocomplete(document.getElementById("buyer_type"), ["Direct client", "Distributor", "Distributor exclusive"], true);
                setProjects(actual_projects)
                updateNewMessages()


                //autocomplete(document.getElementById("workspace_filter_product"), main_data.products.map(product => product.name), true, 'All products');
                //setWorkspaceFilterCompanies()

                //setRegionsFilter()

                createBuyersFilters()
                createWorkspaceFilters(false)
                setWorkspaceFilters()
                setManufacturerWorkSpace()

                setDebtors(main_data.debtors)


                document.getElementById('div_filter_analytic_month').style.display = `none`
                document.getElementById('div_filter_analytic_quarter').style.display = `none`

                setCustomers(json.customers)
                setProductsList(json.products, main_data.cabinet_info)
                //document.querySelectorAll('.edit_buyer[data-buyer-id="1"]')[0].click()


                setMarketingAnalog(json.product_analog)


                setManufacturerIncoterms(json.incoterms)
                createProductsTable(json.products)
                createProductsParams(main_data.lists_data.product_categories)
                setSettingsExchange(json.exchanges)



                //filter_dd_analytic_regions = new Dropmic(document.getElementById('filter_analytic_regions'));
                filter_dd_analytic_year    = new Dropmic(document.getElementById('dd_filter_analytic_year'));
                filter_dd_analytic_period  = new Dropmic(document.getElementById('dd_filter_analytic_period'));
                filter_dd_analytic_quarter = new Dropmic(document.getElementById('dd_filter_analytic_quarter'));
                filter_dd_analytic_month   = new Dropmic(document.getElementById('dd_filter_analytic_month'));
                filter_dd_analytic_budget  = new Dropmic(document.getElementById('dd_filter_analytic_budget'));




                createManufacturerAnalyticFilters()
                setManufacturerAnalyticFilters()
                setManufacturerAnalytic()



                dd_filter_planning_year    = new Dropmic(document.getElementById('dd_filter_planning_year'));
                dd_filter_planning_raf     = new Dropmic(document.getElementById('dd_filter_planning_raf'));
                dd_filter_planning_month   = new Dropmic(document.getElementById('dd_filter_planning_month'));
                dd_filter_planning_type    = new Dropmic(document.getElementById('dd_filter_planning_type'));

                createPlanningDetailFilters()
                createPlanningMainFilters()
                setPlanningFilters()
                createPlanningTable()

                document.querySelector(`.btns-planning-raf[data-value="${data_planning.raf}"]`).click()
                document.getElementById('div_filter_planning_raf').classList.remove("updated")


                products_short = getProductsList(main_data.products)
                autocomplete(document.getElementById("ticket_create_type"), ["Product", "Application", "Commercial", "General"], true);
                autocomplete(document.getElementById("ticket_create_product"), products_short, true);
                autocomplete(document.getElementById("ticket_create_industry"), industries, true);
                autocomplete(document.getElementById("ticket_lang_manufacturer"), main_data.cabinet_info.organization_langs.map((l) => l.lang_name), true, 'English');
                document.getElementById("ticket_lang_manufacturer").value = main_data.cabinet_info.chat_lang

                if (main_data.ticket_organizations.length == 0) {
                    document.getElementById("div_ticket_for_whom").style.display = 'none'
                } else {
                    let manufacturers_name = []
                    main_data.ticket_organizations.together.forEach(function(element) {
                        manufacturers_name.push(element.name)
                    });
                    autocomplete(document.getElementById("ticket_create_for_organization"), manufacturers_name, true);
                    document.getElementById("ticket_create_for_organization").onchange = function (){
                        console.log("123")
                        console.log("value ", this.value)
                    }

                    document.getElementById("div_ticket_for_whom").style.display = 'block'
                }

                updateTickets(true)




                // position changes
                if (main_data.user.position == "Technologist") {
                    document.querySelector(`[data-page="manufacturer_workdesc"]`).parentElement.style.display = 'none'
                    document.querySelector(`[data-page="manufacturer_orders"]`).parentElement.style.display = 'none'
                    document.querySelector(`[data-page="manufacturer_analytics"]`).parentElement.style.display = 'none'
                    document.querySelector(`[data-page="manufacturer_planning"]`).parentElement.style.display = 'none'
                    document.querySelector(`[data-page="manufacturer_pricing"]`).parentElement.style.display = 'none'
                    document.querySelector(`[data-page="manufacturer_settings"]`).parentElement.style.display = 'none'
                    changeCurrentPage("manufacturer_buyers")

                    document.getElementById('btn_start_create_customer').style.display = 'none'
                }

                if (main_data.demo == true){
                    Array.from(document.querySelectorAll(".left-menu-changer")).forEach(function(element) {
                        element.style.display = "flex"
                    })
                }

                document.getElementById('alert_manufacturer_buyers').setAttribute("data-tippy-content", "Customer requested price")

                checkPriceRequests()
                startUpdater()

                tippy('.container_round_image, #payment_copy_balance, #btn_eta_days, #btn_production_days, ' +
                    '.btns_exit, .btns_edit_user ,#btn_planning_details, #alert_manufacturer_buyers,  #btn_create_exchange, ' +
                    '#btn_order_select_buyer, #btn_supply_select_buyer, ' +
                    '.section_new_new, .section_new_person, .section_new_notify, .settings_info_block, .btns_edit_user, ' +
                    '.btns_exit, #cabinet_client_avatar, #manufacturer_logo', {
                    content: 'My tooltip!',
                    followCursor: 'horizontal',
                    animation: 'fade',
                });
            })
            .catch( error => console.error('error:', error) );
    }


    ///// -MANUFACTURER. START /////











    ///// + MANAGE WORKSPACE /////
    let filter_dd_buyers_regions = null;
    let filter_dd_workspace_compare = null;
    let filter_dd_workspace_value = null;
    let workspace_filter_regions   = null
    let workspace_filter_values    = null
    let workspace_filter_compare     = null
    let workspace_filter_customers = null
    let workspace_filter_products  = null
    let workspace_filter = {regions: 'all', value_type: 'tons', compare: 'budget', product: 'All products', company: 'All customers'}
    function createWorkspaceFilters(initial){
        getWorkspaceFiltersBase()
        if (initial){

            filter_dd_workspace_value   = new Dropmic(document.getElementById('dd_filter_ws_value'));
            filter_dd_workspace_compare = new Dropmic(document.getElementById('dd_filter_ws_compare'));
            return }

        createWorkspaceFilterRegions()
        //createWorkspaceFilterValues()
        //createWorkspaceFilterCompare()
        createWorkspaceFilterCustomers()
        createWorkspaceFilterProducts()

        onClickWorkspaceItem()
        setWorkspaceFilters()

        function getWorkspaceFiltersBase(){

            const filters_source = getCookie(cookie_name_workspace)

            if (typeof filters_source !== 'undefined' && filters_source !== 'undefined') {
                workspace_filter = JSON.parse(filters_source)

            } else {

                workspace_filter = {regions:    user_regions.split(","),
                    value_type: 'tons',
                    compare:    'budget',
                    product:    user_products,
                    company:    user_customers}


                //product: main_data.products.map(p => p.name),
                //company: main_data.buyers.map(b => b.name)}
                setCookie(cookie_name_workspace,  JSON.stringify(workspace_filter))

            }


        }

        function createWorkspaceFilterRegions(){
            let html = ''
            user_regions.split(",").forEach((item, i) => {
                html += `<option class="workspace_filter_region" data-value="${getRegionNameFromCode(item)}">${getRegionNameFromCode(item)}</option>`
            })
            document.getElementById("workspace_filter_regions").innerHTML = html
            workspace_filter_regions = new vanillaSelectBox(
                "#workspace_filter_regions",
                {"maxHeight":300,
                    search:true,
                    translations : { "all": "All regions", "items": "regions"}
                })
        }
        function createWorkspaceFilterValues(){
            let html = `<option class="workspace_filter_value" data-value="tons">KG</option>
                        <option class="workspace_filter_value" data-value="cash">USD</option>`

            document.getElementById("workspace_filter_values").innerHTML = html
            workspace_filter_values = new vanillaSelectBox(
                "#workspace_filter_values")
        }
        function createWorkspaceFilterCompare(){
            let html = `<option class="workspace_filter_compare" data-value="budget">Plan</option>
                        <option class="workspace_filter_compare" data-value="prev">Previous year</option>`

            document.getElementById("workspace_filter_compare").innerHTML = html
            workspace_filter_compare = new vanillaSelectBox(
                "#workspace_filter_compare")
        }

        function createWorkspaceFilterCustomers(){
            let html = ''
            main_data.buyers.map(a => a.name).forEach((item, i) => {
                html += `<option class="workspace_filter_customer" data-value="${item}">${item}</option>`
            })
            document.getElementById("workspace_filter_customers").innerHTML = html
            workspace_filter_customers = new vanillaSelectBox(
                "#workspace_filter_customers",
                {"maxHeight":300,
                    search:true,
                    translations : { "all": "All customers", "items": "customers"}
                })
        }

        function createWorkspaceFilterProducts(){
            let products = main_data.products.map(a => a.name)
            let html = ''
            products.forEach((item, i) => {
                html += `<option class="workspace_filter_product" data-value="${item}">${item}</option>`
            })
            document.getElementById("workspace_filter_products").innerHTML = html
            workspace_filter_products = new vanillaSelectBox(
                "#workspace_filter_products",
                {"maxHeight":300,
                    search:true,
                    translations : { "all": "All products", "items": "products"}
                })
        }


        function onClickWorkspaceItem(){
            /*
            Array.from(document.querySelectorAll(".workspace_filter_value, .workspace_filter_compare")).forEach(function(element) {
                element.addEventListener('click', changeWorkspaceFilter );
            });

            function changeWorkspaceFilter(){
                let class_name = this.classList[2]
                let parent = this.parentElement.parentElement.parentElement.parentElement

                switch (class_name) {
                    case "workspace_filter_value":
                        workspace_filter.value_type = this.getAttribute("data-value")
                        break;
                    case "workspace_filter_compare":
                        workspace_filter.compare = this.getAttribute("data-value")
                        document.getElementById('workspace_filter_compare').innerText = `Compare vs ${workspace_filter.compare == 'budget' ? 'plan' : 'prev'}`
                        break;
                }
                parent.classList.add("updated")

                setCookie(cookie_name_workspace, JSON.stringify(workspace_filter))

                setWorkspaceFilters()

                if (user.organization_type == 'manufacturer') {
                    setManufacturerWorkSpace()
                } else {
                    setBuyerWorkspace()
                }

            }

*/
            Array.from(document.querySelectorAll(".workspace_filter_region, .workspace_filter_customer, .workspace_filter_product")).forEach(function(element) {
                element.addEventListener('click', showBtnWorkspaceUpdate );
            });

            function showBtnWorkspaceUpdate(){
                setTimeout(() => {
                    if (this.classList.contains('workspace_filter_product')) {
                        workspace_filter.product = workspace_filter_products.getResult()
                    } else if (this.classList.contains('workspace_filter_customer')) {
                        let selected_customers = workspace_filter_customers.getResult()
                        let selected_customers_regions = []
                        selected_customers.forEach((c) => {
                            let region = main_data.buyers.filter((b) => { return b.name == c  })[0].region

                            if (!selected_customers_regions.includes(region)) {
                                selected_customers_regions.push(region)
                            }
                        })

                        let selected_customers_regions_names = []
                        selected_customers_regions.forEach(r => {selected_customers_regions_names.push(getRegionNameFromCode(r))})

                        if (selected_customers_regions_names.length === 0) {
                            selected_customers_regions = user_regions.split(",")
                            selected_customers_regions.forEach(r => {selected_customers_regions_names.push(getRegionNameFromCode(r))})
                        }

                        workspace_filter_regions.setValue(selected_customers_regions_names)
                        workspace_filter.regions = selected_customers_regions_names
                        workspace_filter.company = selected_customers

                    } else if (this.classList.contains('workspace_filter_region')) {
                        let selected_regions = workspace_filter_regions.getResult()


                        let new_customers = main_data.buyers.filter((buyer) => {
                            if (selected_regions.includes(buyer.region)) {
                                return buyer
                            }
                        })

                        if (selected_regions.length === 0) {
                            new_customers = main_data.buyers
                        }
                        workspace_filter_customers.setValue(new_customers.map(p => p.name))
                        workspace_filter.regions = selected_regions
                        workspace_filter.company = new_customers.map(p => p.name)
                    }

                    setCookie(cookie_name_workspace, JSON.stringify(workspace_filter))
                    this.parentElement.parentElement.parentElement.parentElement.parentElement.classList.add('updated')

                    document.getElementById('div_workspace_container').style.display = 'none'
                    document.getElementById('btn_workspace_filter').style.display    = 'block'

                }, 200)
            }



            Array.from(document.querySelectorAll(".btns-workspace-filter")).forEach(function(element) {
                element.addEventListener('click', changeWorkspaceFilter );
            });

            function changeWorkspaceFilter(){
                let class_name = this.classList[2]
                let parent = this.parentElement.parentElement.parentElement.parentElement

                switch (class_name) {

                    case "btns-ws-value":

                        filter_dd_workspace_value.close()
                        workspace_filter.value_type = this.getAttribute("data-value")
                        document.getElementById('filter_ws_value')  .innerText = "Value in " + this.innerText
                        break;
                    case "btns-ws-compare":
                        filter_dd_workspace_compare.close()
                        workspace_filter.compare = this.getAttribute("data-value")

                        document.getElementById('filter_ws_compare').innerText = `vs ${workspace_filter.compare == 'budget' ? 'plan' : 'prev'}`
                        break;
                }
                parent.classList.add("updated")

                setCookie(cookie_name_workspace, JSON.stringify(workspace_filter))

                setWorkspaceFilters()

                if (user.organization_type == 'manufacturer') {
                    setManufacturerWorkSpace()
                } else {
                    setBuyerWorkspace()
                }

            }
        }

    }
    function setWorkspaceFilters(){

        console.log("setWorkspaceFilters workspace_filter", workspace_filter)

        workspace_filter_regions.setValue(workspace_filter.regions)
        //workspace_filter_values.setValue(workspace_filter.value_type)
        //workspace_filter_compare.setValue(workspace_filter.compare)
        workspace_filter_customers.setValue(workspace_filter.company)
        workspace_filter_products.setValue(workspace_filter.product)

        let value_name   = document.querySelectorAll(`.btns-ws-value[data-value="${workspace_filter.value_type}"]`)[0].textContent
        let compare_name = document.querySelectorAll(`.btns-ws-compare[data-value="${workspace_filter.compare}"]`)[0].textContent

        document.getElementById('filter_ws_value')  .innerText = "Value in " +  value_name
        document.getElementById('filter_ws_compare')  .innerText = "vs " + compare_name

    }
    async function updateWorkSpaceAll(){
        const btn = document.getElementById('btn_workspace_filter')
        const text = document.getElementById('text_workspace_filter')
        btn.style.display = 'none'
        text.style.display = 'block'
        sendRequest("POST", "get_workspace_all", {workspace_filter: workspace_filter})
            .then(data => {

                if (user.organization_type == 'manufacturer') {
                    workspace_data = data.workspace
                    setManufacturerWorkSpace()
                    text.style.display = 'none'
                } else {
                    main_data.workspace = data.workspace
                    setBuyerWorkspace()
                }
            })
            .catch(err => console.log(err))
    }
    document.getElementById('btn_workspace_filter').addEventListener('click', function(){


        setCookie(cookie_name_workspace,  JSON.stringify(workspace_filter))

        updateWorkSpaceAll()
    })


    let tabs_numbers = document.querySelectorAll('.tabs_ws_numbers .tab_item')
    Array.from(tabs_numbers).forEach(function(element) {
        element.addEventListener('click', changeNumberTab  )
    });
    function changeNumberTab(){
        let parent = this.parentElement.parentElement
        let tab_name = this.getAttribute("data-tab")
        Array.from(parent.getElementsByClassName('tab_item')).forEach(function(element) {
            element.classList.remove("active")
        })
        this.classList.add("active")

        Array.from(parent.getElementsByClassName('workspace_block_buyer')).forEach(function(element) {
            element.style.display = 'none'
            if (element.getAttribute("data-type") == tab_name) {
                element.style.display = 'flex'
            }
        })

    }


    let tabs_updates = document.querySelectorAll('.tabs_ws_updates .tab_item')
    Array.from(tabs_updates).forEach(function(element) {
        element.addEventListener('click', changeUpdatesTab  )
    });
    function changeUpdatesTab(){
        let parent = this.parentElement.parentElement
        let tab_name = this.getAttribute("data-tab")
        Array.from(parent.getElementsByClassName('tab_item')).forEach(function(element) {
            element.classList.remove("active")
        })
        this.classList.add("active")

        Array.from(parent.getElementsByClassName('workspace_block')).forEach(function(element) {
            element.style.display = 'none'
            if (element.getAttribute("data-type") == tab_name) {
                element.style.display = 'block'
            }
        })

    }


    let tabs_data = document.querySelectorAll('.tabs_ws_data .tab_item')
    Array.from(tabs_data).forEach(function(element) {
        element.addEventListener('click', changeDataTab  )
    });
    function changeDataTab(){
        let parent = this.parentElement.parentElement
        let tab_name = this.getAttribute("data-tab")
        Array.from(parent.getElementsByClassName('tab_item')).forEach(function(element) {
            element.classList.remove("active")
        })
        this.classList.add("active")

        Array.from(parent.getElementsByClassName('workspace_block')).forEach(function(element) {
            element.style.display = 'none'
            if (element.getAttribute("data-type") == tab_name) {
                element.style.display = 'block'
            }
        })

    }



    function setManufacturerWorkSpace(){

        setWSGraphsPeriods("manufacturer")

        let datas = [workspace_data.projects.info.status_2, workspace_data.projects.info.status_3, workspace_data.projects.info.status_4 ]
        setWSProjects(datas, "workspace_table_projects")

        // Прорисовываем графики
        document.querySelectorAll(`.graph_type_orders[data-value=${workspace_filter.value_type}]`)[0].click()
        document.querySelectorAll(`.graph_type_supplies[data-value=${workspace_filter.value_type}]`)[0].click()

        document.getElementById('div_workspace_container').style.display = 'block'
        document.getElementById('btn_workspace_filter').style.display = 'none'
    }
    function setBuyerWorkspace(){
        document.getElementById("div_buyer_workspace_numbers").style.display = 'none'
        document.getElementById("div_buyer_workspace_graphs") .style.display = 'none'
        if (main_data.cabinet_info.show_planning_graphs) {
            document.getElementById("div_buyer_workspace_graphs")    .style.display = 'flex'
            workspace_data = main_data.workspace
            setWSGraphsPeriods("buyer")
        } else {
            document.getElementById("div_buyer_workspace_numbers")    .style.display = 'flex'
            document.getElementById("buyer_workspace_month")  .innerHTML = formatNum(main_data.workspace.total_deliveries.month) + " KG"
            document.getElementById("buyer_workspace_quarter").innerHTML = formatNum(main_data.workspace.total_deliveries.quarter) + " KG"
            document.getElementById("buyer_workspace_year")   .innerHTML = formatNum(main_data.workspace.total_deliveries.year) + " KG"
        }


        setCreditLimit()

        workspace_graph_main_type     = "KG"
        const ordered_graph_data = [
            main_data.workspace.ordered_products.info.status_12.tons,
            main_data.workspace.ordered_products.info.status_34.tons,
            main_data.workspace.ordered_products.info.status_55.tons]
        setWSProducts(ordered_graph_data, 'workspace_buyer_table_orders')

        const graph_data = [
            main_data.workspace.supplies.info.status_6.tons,
            main_data.workspace.supplies.info.status_7.tons,
            main_data.workspace.supplies.info.status_10.tons
        ]
        setWSSupplies(graph_data, 'workspace_buyer_table_supplies')

        const project_data = [
            main_data.workspace.projects.info.status_2,
            main_data.workspace.projects.info.status_3,
            main_data.workspace.projects.info.status_4
        ]
        setWSProjects(project_data, "workspace_buyer_table_projects")

    }


    let workspace_settings = {period: 'year', region: 'all'}
    Array.from(document.getElementsByClassName("dd_ws_period")).forEach(function(element) {
        element.addEventListener('click', changeWSPeriod)
    });
    function changeWSPeriod(){
        let parent = this.parentElement.parentElement.parentElement
        parent.getElementsByClassName('more')[0].innerText = this.innerText

        workspace_settings.period = this.getAttribute("data-result")
    }

    Array.from(document.getElementsByClassName("dd_ws_regions")).forEach(function(element) {
        element.addEventListener('click', changeWSRegion)
    });
    function changeWSRegion(){
        let parent = this.parentElement.parentElement.parentElement
        parent.getElementsByClassName('more')[0].innerText = this.innerText

        workspace_settings.region = this.getAttribute("data-result")


    }


    let workspace_compare_period_type = "raf"
    let workspace_graph_main_type     = "USD"
    Array.from(document.querySelectorAll(".workspace_graph_main_btns ")).forEach(function(element) {
        element.addEventListener('click', changeMainGraphType );
    });
    function changeMainGraphType(){
        const current_type = this.getAttribute("data-value")
        Array.from(document.querySelectorAll(`.${this.classList[0]}`)).forEach(function(element) {
            element.classList.remove('active')
            if (element.getAttribute("data-value") === current_type) {
                element.classList.add('active')
            }
        });

        workspace_graph_main_type = this.getAttribute("data-value")
        setWSGraphs()
    }


    let workspace_compare_type = "cash"
    let workspace_act_vs_raf_type = "USD"
    Array.from(document.querySelectorAll(".workspace_act_vs_raf_btns ")).forEach(function(element) {
        element.addEventListener('click', changeActRafType );
    });
    function changeActRafType(){
        const current_type = this.getAttribute("data-value")
        Array.from(document.querySelectorAll(`.${this.classList[0]}`)).forEach(function(element) {
            element.classList.remove('active')
            if (element.getAttribute("data-value") === current_type) {
                element.classList.add('active')
            }
        });

        workspace_act_vs_raf_type = this.getAttribute("data-value")
        setWSActvsRaf()
    }

    let workspace_act_vs_prev_type = "USD"
    Array.from(document.querySelectorAll(".workspace_act_vs_prev_btns ")).forEach(function(element) {
        element.addEventListener('click', changeActPrevType );
    });
    function changeActPrevType(){
        const current_type = this.getAttribute("data-value")
        Array.from(document.querySelectorAll(`.${this.classList[0]}`)).forEach(function(element) {
            element.classList.remove('active')
            if (element.getAttribute("data-value") === current_type) {
                element.classList.add('active')
            }
        });

        workspace_act_vs_prev_type = this.getAttribute("data-value")
        setWSActvsPrev()
    }


    function setWSActvsRaf(){
        function increase(limit) {
            let SPEED = 20;
            for(let i = 0; i <= limit; i++) {
                setTimeout(function () {
                    //document.getElementById("value1").innerHTML = i + "%";
                    document.getElementById("ws_chart_act_vs_raf").style.width = i + "%";
                }, SPEED * i);
            }
        }

        if (workspace_act_vs_raf_type === "USD") {
            increase(workspace_data.overview.cash_abs);
            document.getElementById('ws_vs_raf_act')    .innerText = workspace_data.overview.cash
            document.getElementById('ws_vs_raf_percent').innerText = parseInt(workspace_data.overview.cash_abs) + '%'
            document.getElementById('ws_vs_raf_budget') .innerText = workspace_data.overview.cash_raf
        } else {
            increase(workspace_data.overview.tons_abs);
            document.getElementById('ws_vs_raf_act')    .innerText = workspace_data.overview.tons
            document.getElementById('ws_vs_raf_percent').innerText = parseInt(workspace_data.overview.tons_abs) + '%'
            document.getElementById('ws_vs_raf_budget') .innerText = workspace_data.overview.tons_raf
        }

    }
    function setWSActvsPrev(){
        function increase(limit) {
            let SPEED = 20;

            for(let i = 0; i <= limit; i++) {
                setTimeout(function () {
                    //document.getElementById("value1").innerHTML = i + "%";
                    document.getElementById("ws_chart_act_vs_prev").style.width = i + "%";
                }, SPEED * i);
            }
        }

        if (workspace_act_vs_prev_type === "USD") {
            increase(workspace_data.overview.cash_prev_abs);
            document.getElementById('ws_vs_prev_act')    .innerText = workspace_data.overview.cash
            document.getElementById('ws_vs_prev_percent').innerText = parseInt(workspace_data.overview.cash_prev_abs) + '%'
            document.getElementById('ws_vs_prev_budget') .innerText = workspace_data.overview.cash_prev
        } else {
            increase(workspace_data.overview.tons_prev_abs);
            document.getElementById('ws_vs_prev_act')    .innerText = workspace_data.overview.tons
            document.getElementById('ws_vs_prev_percent').innerText = parseInt(workspace_data.overview.tons_prev_abs) + '%'
            document.getElementById('ws_vs_prev_budget') .innerText = workspace_data.overview.tons_prev
        }

    }

    let workspace_graph_overview = null



    function setWSGraphs(){

        // document.getElementById('workspace_tons_act').innerHTML = `${data.overview.tons_act}%`
        // document.getElementById('workspace_cash_act').innerHTML = `${data.overview.cash_act}%`

        let data = workspace_data.overview_graph.cash
        let border_color = window.chartColors.cash_new
        let background_color = window.chartColors.cash_old
        if (workspace_graph_main_type !== 'USD'){
            data = workspace_data.overview_graph.tons
            border_color = window.chartColors.tons_new
            background_color = window.chartColors.tons_old
        }

        let options = {
            type: 'line',
            radius: 0,
            responsive: true,
            legend: {display: false},
            layout: {
                padding: {
                    left: 20,
                    right: 20,
                    top: 15,
                    bottom: 0
                }
            },
            scales: {
                x: [{
                    ticks: {
                        beginAtZero: true,
                        display: true
                    }
                }]
            },

            plugins: {tooltip: {enabled: false}}
        }

        let overview_data = {
            labels: workspace_data.overview_graph.dates,
            datasets: [{label: '',
                interaction: {
                    mode: 'index',
                    axis: 'y'
                },
                pointRadius: 0,
                borderWidth: 4,
                borderColor: border_color,
                fill: true,
                backgroundColor: background_color,
                data: data},

            ]
        };
        var ctx = document.getElementById('workspace_graph_overview').getContext('2d');
        if (workspace_graph_overview != null) workspace_graph_overview.destroy()
        workspace_graph_overview = new Chart(ctx, {
            type:    'line',
            data:    overview_data,
            options: options
        });

    }
    function noDataGraph (data_graph, div_id, labels = null) {
        let table_data = null
        if (labels) {
            table_data = `<div style="width:100%; display:flex; justify-content:center;">
                                <div class="workspace_block_graph nodata pie" style="background-color: ${window.chartColors.empty_graphs}">
                                        NO DATA
                                </div>
                            </div>`
            data_graph.forEach(function(element, i) {
                table_data += ` <div class="workspace_row nodata">
                                        <div class="title nodata">
                                            <div class="graph_legend" style="background-color: ${window.chartColors.empty_graphs}"></div>
                                            ${labels[i]}
                                        </div>
                                        <div>-</div>
                                    </div>`
            });
            table_data += ` <div class="workspace_row nodata" >
                                    <div class="title nodata">Total</div>
                                    <div>-</div>
                            </div>`

            div_id.innerHTML = table_data
        } else {
            table_data = `  <div style="width:100%; display:flex; justify-content:center;">
                                <div class="workspace_block_graph nodata doughnut" style="border-color: ${window.chartColors.empty_graphs}">
                                    NO DATA
                                </div>
                            </div>`

            div_id.innerHTML = table_data
        }
    }

    Array.from(document.querySelectorAll(".graph_type_supplies")).forEach(function(element) {
        element.addEventListener('click', changeSuppliesType );
    });
    function changeSuppliesType(){
        const current_type = this.getAttribute("data-value")
        Array.from(document.querySelectorAll(`.${this.classList[0]}`)).forEach(function(element) {
            element.classList.remove('active')
            if (element.getAttribute("data-value") === current_type) {
                element.classList.add('active')
            }
        });

        const graph_data = [
            workspace_data.supplies.info.status_6[`${this.getAttribute("data-value")}`],
            workspace_data.supplies.info.status_7[`${this.getAttribute("data-value")}`],
            workspace_data.supplies.info.status_10[`${this.getAttribute("data-value")}`]
        ]
        setWSSupplies(graph_data, 'workspace_manufacturer_table_supplies')

    }
    Array.from(document.querySelectorAll(".graph_type_orders")).forEach(function(element) {
        element.addEventListener('click', changeOrdersType );
    });
    function changeOrdersType(){
        const current_type = this.getAttribute("data-value")
        Array.from(document.querySelectorAll(`.${this.classList[0]}`)).forEach(function(element) {
            element.classList.remove('active')
            if (element.getAttribute("data-value") === current_type) {
                element.classList.add('active')
            }
        });


        const ordered_graph_data = [
            workspace_data.ordered_products.info.status_12[`${this.getAttribute("data-value")}`],
            workspace_data.ordered_products.info.status_34[`${this.getAttribute("data-value")}`],
            workspace_data.ordered_products.info.status_55[`${this.getAttribute("data-value")}`]
        ]
        setWSProducts(ordered_graph_data, 'workspace_manufacturer_table_orders')

    }

    let graph_ws_year    = null
    let graph_ws_quarter = null
    let graph_ws_month   = null
    let workspace_graph_projects = null
    let workspace_manufacturer_graph_orders = null
    let workspace_manufacturer_graph_supplies = null

    function setWSGraphsPeriods(for_whom){

        let suffix = ''
        if (for_whom == 'buyer') {suffix = 'buyer_'}

        const month_fact      = document.getElementById(`${suffix}ws_progress_month_fact`)
        const month_percent   = document.getElementById(`${suffix}ws_progress_month_percent`)
        const month_compare   = document.getElementById(`${suffix}ws_progress_month_compare`)
        const quarter_fact    = document.getElementById(`${suffix}ws_progress_quarter_fact`)
        const quarter_percent = document.getElementById(`${suffix}ws_progress_quarter_percent`)
        const quarter_compare = document.getElementById(`${suffix}ws_progress_quarter_compare`)
        const year_fact       = document.getElementById(`${suffix}ws_progress_year_fact`)
        const year_percent    = document.getElementById(`${suffix}ws_progress_year_percent`)
        const year_compare    = document.getElementById(`${suffix}ws_progress_year_compare`)


        Chart.Tooltip.positioners.custom = function(elements, eventPosition) {
            return {
                x: eventPosition.x,
                y: eventPosition.y
            };
        }


        const options = {
            //responsive: true,
            cutout: '90%',
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    intersect: true,
                    position : 'custom',   //<-- important same name as your function above
                }
            },
            radius: 100,
            borderWidth: 0
        }

        Chart.defaults.elements.arc.borderWidth = 0;
        Chart.defaults.elements.arc.roundedCornersFor = {
            "start": 0, //0th position of Label 1
            "end": 0 //2nd position of Label 2
        };
        let plugins = [{

            afterUpdate: function(chart) {
                if (chart.options.elements.arc.roundedCornersFor !== undefined) {
                    var arcValues = Object.values(chart.options.elements.arc.roundedCornersFor);

                    arcValues.forEach(function(arcs) {
                        arcs = Array.isArray(arcs) ? arcs : [arcs];
                        arcs.forEach(function(i) {
                            var arc = chart.getDatasetMeta(0).data[i];
                            arc.round = {
                                x: (chart.chartArea.left + chart.chartArea.right) / 2,
                                y: (chart.chartArea.top + chart.chartArea.bottom) / 2,
                                radius: (arc.outerRadius + arc.innerRadius) / 2,
                                thickness: (arc.outerRadius - arc.innerRadius) / 2,
                                backgroundColor: arc.options.backgroundColor
                            }
                        });
                    });
                }
            },
            afterDraw: (chart) => {

                if (chart.options.elements.arc.roundedCornersFor !== undefined) {
                    var {
                        ctx,
                        canvas
                    } = chart;
                    var arc,
                        roundedCornersFor = chart.options.elements.arc.roundedCornersFor;
                    for (var position in roundedCornersFor) {
                        var values = Array.isArray(roundedCornersFor[position]) ? roundedCornersFor[position] : [roundedCornersFor[position]];
                        values.forEach(p => {
                            arc = chart.getDatasetMeta(0).data[p];
                            var startAngle = Math.PI / 2 - arc.startAngle;
                            var endAngle = Math.PI / 2 - arc.endAngle;
                            ctx.save();
                            ctx.translate(arc.round.x, arc.round.y);
                            ctx.fillStyle = arc.options.backgroundColor;
                            ctx.beginPath();
                            if (position == "start") {
                                ctx.arc(arc.round.radius * Math.sin(startAngle), arc.round.radius * Math.cos(startAngle), arc.round.thickness, 0, 2 * Math.PI);
                            } else {
                                ctx.arc(arc.round.radius * Math.sin(endAngle), arc.round.radius * Math.cos(endAngle), arc.round.thickness, 0, 2 * Math.PI);
                            }
                            ctx.closePath();
                            ctx.fill();
                            ctx.restore();
                        });

                    };
                }
            }
        }];

        var ctx;
        let graph_data;


        let color = window.chartColors.graph_ws_cash
        if (workspace_filter.value_type === 'tons') {color = window.chartColors.graph_ws_tons}

        let labels = [workspace_data.total_graphs.textes.month.current_period,
            workspace_data.total_graphs.textes.month.left_to_raf]

        let left_value = workspace_data.total_graphs.raf.month[`total_${workspace_filter.value_type}`] - workspace_data.total_graphs.current.month[`total_${workspace_filter.value_type}`]
        let data = [
            workspace_data.total_graphs.current.month[`total_${workspace_filter.value_type}`],
            left_value < 0 ? 0 : left_value,
        ]

        if (workspace_filter.compare === 'prev') {
            labels = [workspace_data.total_graphs.textes.month.current_period,
                workspace_data.total_graphs.textes.month.left_to_prev]
            left_value = workspace_data.total_graphs.prev.month[`total_${workspace_filter.value_type}`] - workspace_data.total_graphs.current.month[`total_${workspace_filter.value_type}`]
            data = [
                workspace_data.total_graphs.current.month[`total_${workspace_filter.value_type}`],
                left_value < 0 ? 0 : left_value
            ]
        }

        month_fact.classList.remove("nodata_doughnut");
        month_percent.classList.remove("nodata_doughnut_center");
        month_compare.classList.remove("nodata_doughnut");
        setWSProgresses('month', for_whom)

        ctx = document.getElementById(`${suffix}graph_ws_month`).getContext('2d');

        var gradient = ctx.createLinearGradient(215, 0, 15, 15);
        gradient.addColorStop(0, "#FFBF9F");
        gradient.addColorStop(1, "#FE8C98");
        graph_data = {
            labels: labels,
            datasets: [{
                label: '',
                //borderRadius: 15,
                // borderColor: window.chartColors.chartBorderColor,
                backgroundColor: [
                    gradient,
                    window.chartColors.empty_graphs] ,
                data: data,
                rotation: 5,

            }]
        };


        if (left_value <= 0 && data[0] != 0) {
            ctx = document.getElementById(`${suffix}graph_ws_month`).getContext('2d')
            if (graph_ws_month != null) graph_ws_month.destroy()
            document.getElementById(`container_graph_ws_month_complete`).style.display = 'block'
            document.getElementById(`container_graph_ws_month_process`) .style.display = 'none'

            document.getElementById(`buyer_container_graph_ws_month_complete`).style.display = 'block'
            document.getElementById(`buyer_container_graph_ws_month_process`) .style.display = 'none'
        } else {
            document.getElementById(`container_graph_ws_month_complete`).style.display = 'none'
            document.getElementById(`container_graph_ws_month_process`) .style.display = 'block'

            document.getElementById(`buyer_container_graph_ws_month_complete`).style.display = 'none'
            document.getElementById(`buyer_container_graph_ws_month_process`) .style.display = 'block'

            plugins = plugins;
            options.borderWidth = 0;
            options.borderColor = 0;

            //document.getElementById('ws_progress_month_fact').style.color = window.chartColors.grad_ws_month_0;


            ctx = document.getElementById(`${suffix}graph_ws_month`).getContext('2d')
            if (graph_ws_month != null) graph_ws_month.destroy()
            graph_ws_month = new Chart(ctx, {
                type: 'doughnut',
                data: graph_data,
                options: options,
                plugins: plugins,
            });
        }








        labels = [workspace_data.total_graphs.textes.quarter.current_period,
            workspace_data.total_graphs.textes.quarter.left_to_raf]

        left_value = workspace_data.total_graphs.raf.quarter[`total_${workspace_filter.value_type}`] - workspace_data.total_graphs.current.quarter[`total_${workspace_filter.value_type}`]
        data =  [workspace_data.total_graphs.current.quarter[`total_${workspace_filter.value_type}`],
            left_value < 0 ? 0 : left_value]
        if (workspace_filter.compare === 'prev') {
            labels = [workspace_data.total_graphs.textes.quarter.current_period,
                workspace_data.total_graphs.textes.quarter.left_to_prev]
            left_value = workspace_data.total_graphs.prev.quarter[`total_${workspace_filter.value_type}`] - workspace_data.total_graphs.current.quarter[`total_${workspace_filter.value_type}`]
            data = [
                workspace_data.total_graphs.current.quarter[`total_${workspace_filter.value_type}`],
                left_value < 0 ? 0 : left_value
            ]
        }

        gradient = ctx.createLinearGradient(215, 0, 15, 15);
        gradient.addColorStop(0, "#00E86A");
        gradient.addColorStop(1, "#0399BF");
        graph_data = {
            labels: labels,
            datasets: [{
                label: '',
                //borderRadius: 15,
                // borderColor: window.chartColors.chartBorderColor,
                backgroundColor: [
                    gradient,
                    window.chartColors.empty_graphs
                ] ,

                data: data,
                rotation: 5,
            }]
        };

        quarter_fact   .classList.remove("nodata_doughnut");
        quarter_percent.classList.remove("nodata_doughnut_center");
        quarter_compare.classList.remove("nodata_doughnut");
        setWSProgresses('quarter', for_whom)



        if (left_value <= 0 && data[0] != 0) {
            ctx = document.getElementById(`${suffix}graph_ws_quarter`).getContext('2d')
            if (graph_ws_quarter != null) graph_ws_quarter.destroy()
            document.getElementById(`container_graph_ws_quarter_complete`).style.display = 'block'
            document.getElementById(`container_graph_ws_quarter_process`) .style.display = 'none'
            document.getElementById(`buyer_container_graph_ws_quarter_complete`).style.display = 'block'
            document.getElementById(`buyer_container_graph_ws_quarter_process`) .style.display = 'none'
        } else {
            document.getElementById(`container_graph_ws_quarter_complete`).style.display = 'none'
            document.getElementById(`container_graph_ws_quarter_process`) .style.display = 'block'
            document.getElementById(`buyer_container_graph_ws_quarter_complete`).style.display = 'none'
            document.getElementById(`buyer_container_graph_ws_quarter_process`) .style.display = 'block'

            plugins = plugins;
            options.borderWidth = 0;
            options.borderColor = 0;
            //document.getElementById('ws_progress_quarter_fact').style.color = window.chartColors.grad_ws_quarter_0;


            ctx = document.getElementById(`${suffix}graph_ws_quarter`).getContext('2d')
            if (graph_ws_quarter != null) graph_ws_quarter.destroy()
            graph_ws_quarter = new Chart(ctx, {
                type: 'doughnut',
                data: graph_data,
                options: options,
                plugins: plugins,
            });
        }







        labels = [workspace_data.total_graphs.textes.year.current_period,
            workspace_data.total_graphs.textes.year.left_to_raf]

        //TODO

        left_value = workspace_data.total_graphs.raf.year[`total_${workspace_filter.value_type}`] - workspace_data.total_graphs.current.year[`total_${workspace_filter.value_type}`]
        data =  [
            workspace_data.total_graphs.current.year[`total_${workspace_filter.value_type}`],
            left_value < 0 ? 0 : left_value
        ]
        if (workspace_filter.compare === 'prev') {
            labels = [workspace_data.total_graphs.textes.year.current_period,
                workspace_data.total_graphs.textes.year.left_to_prev]

            //let percent_value = parseFloat(workspace_data.total_graphs.prev.year[`total_${workspace_filter.value_type}`]) - parseFloat(workspace_data.total_graphs.current.year[`total_${workspace_filter.value_type}`])
            left_value = workspace_data.total_graphs.prev.year[`total_${workspace_filter.value_type}`] - workspace_data.total_graphs.current.year[`total_${workspace_filter.value_type}`]
            data = [
                workspace_data.total_graphs.current.year[`total_${workspace_filter.value_type}`],
                left_value < 0 ? 0 : left_value,
            ]
        }
        year_fact   .classList.remove("nodata_doughnut");
        year_percent.classList.remove("nodata_doughnut_center");
        year_compare.classList.remove("nodata_doughnut");
        setWSProgresses('year', for_whom)

        gradient = ctx.createLinearGradient(215, 250, 15, 15);
        gradient.addColorStop(1, "#F54F5A");
        gradient.addColorStop(0, "#CC78FF");
        // gradient.addColorStop(1, "#BD0DA1");
        graph_data = {
            labels: labels,
            datasets: [{
                label: '',
                //borderRadius: 15,
                // borderColor: window.chartColors.chartBorderColor,
                backgroundColor: [
                    gradient,
                    window.chartColors.empty_graphs
                ] ,
                data: data,
                rotation: 3,
            }]
        };

        //if (document.getElementById("ws_progress_year_percent").innerHTML == '100%') {
        if (left_value <= 0 && data[0] != 0) {
            ctx = document.getElementById(`${suffix}graph_ws_year`).getContext('2d')
            if (graph_ws_year != null) graph_ws_year.destroy()
            document.getElementById(`container_graph_ws_year_complete`).style.display = 'block'
            document.getElementById(`container_graph_ws_year_process`) .style.display = 'none'

            document.getElementById(`buyer_container_graph_ws_year_complete`).style.display = 'block'
            document.getElementById(`buyer_container_graph_ws_year_process`) .style.display = 'none'
        } else {
            document.getElementById(`container_graph_ws_year_complete`).style.display = 'none'
            document.getElementById(`container_graph_ws_year_process`) .style.display = 'block'

            document.getElementById(`buyer_container_graph_ws_year_complete`).style.display = 'none'
            document.getElementById(`buyer_container_graph_ws_year_process`) .style.display = 'block'

            plugins = plugins;
            options.borderWidth = 0;
            options.borderColor = 0;
            gradient = ctx.createLinearGradient(215, 250, 15, 15);
            gradient.addColorStop(1, window.chartColors.grad_ws_year_0);
            gradient.addColorStop(0, window.chartColors.grad_ws_year_1);
            document.getElementById('ws_progress_year_fact').style.color = window.chartColors.grad_ws_year_0;


            ctx = document.getElementById(`${suffix}graph_ws_year`).getContext('2d')
            if (graph_ws_year != null) graph_ws_year.destroy()
            graph_ws_year = new Chart(ctx, {
                type: 'doughnut',
                data: graph_data,
                options: options,
                plugins: plugins,
            });
        }



        function setWSProgresses(period, for_whom){
            function increase(limit) {
                let SPEED = 40;

                for(let i = 0; i <= limit; i++) {
                    setTimeout(function () {
                        document.getElementById(`ws_progress_${period}_percent`).innerText = i + "%";
                    }, SPEED * i);
                }
            }

            let suffix = ''
            if (for_whom == 'buyer') {
                suffix = 'buyer_'
                workspace_filter.value_type = 'tons'
            }

            let fact    = document.getElementById(`${suffix}ws_progress_${period}_fact`)
            let percent = document.getElementById(`${suffix}ws_progress_${period}_percent`)
            let compare = document.getElementById(`${suffix}ws_progress_${period}_compare`)


            let fact_value = parseInt(workspace_data.total_graphs.current[`${period}`][`total_${workspace_filter.value_type}`])

            fact.innerText = formatNum(fact_value)



            fact   .setAttribute("data-tippy-content", workspace_data.total_graphs.textes[`${period}`].current_period)
            let percent_value = 0
            if (workspace_filter.compare === 'budget') {
                percent_value = parseInt(100 * workspace_data.total_graphs.current[`${period}`][`total_${workspace_filter.value_type}`] / workspace_data.total_graphs.raf[`${period}`][`total_${workspace_filter.value_type}`])
                if (isNaN(percent_value)) {percent_value = 0 }
                percent.setAttribute("data-tippy-content", workspace_data.total_graphs.textes[`${period}`].current_vs_raf)
                compare.setAttribute("data-tippy-content", workspace_data.total_graphs.textes[`${period}`].raf)
                compare.innerText  = formatNum(parseInt(workspace_data.total_graphs.raf[`${period}`][`total_${workspace_filter.value_type}`]))
            } else {
                percent_value = parseInt(100 * workspace_data.total_graphs.current[`${period}`][`total_${workspace_filter.value_type}`] / workspace_data.total_graphs.prev[`${period}`][`total_${workspace_filter.value_type}`])
                if (isNaN(percent_value)) {percent_value = 0 }
                percent.setAttribute("data-tippy-content", workspace_data.total_graphs.textes[`${period}`].current_vs_prev)
                compare.setAttribute("data-tippy-content", workspace_data.total_graphs.textes[`${period}`].prev_period)
                compare.innerText  = formatNum(parseInt(workspace_data.total_graphs.prev[`${period}`][`total_${workspace_filter.value_type}`]))
            }

            percent.innerText = percent_value + '%'
            increase(percent_value);


            tippy('.text_current, .text_percent, .text_compared', {
                followCursor: 'horizontal',
                animation: 'fade',
            });
        }
    }
    function setWSProducts( ordered_graph_data, div_id){

        const labels        = ['Ordering', 'Production', 'Done']
        const labels_colors = [window.chartColors.order_status_12, window.chartColors.order_status_34, window.chartColors.order_status_55]


        let table_data_sum = 0
        let table_data = ``
        if (ordered_graph_data.every(element => element == 0)) {
            if (workspace_manufacturer_graph_orders != null) workspace_manufacturer_graph_orders.destroy()
            noDataGraph(ordered_graph_data, document.getElementById(div_id), labels)

        } else {

            ordered_graph_data.forEach(function(element, i) {
                table_data_sum += parseInt(element)
                table_data += ` <div class="workspace_row">
                                        <div class="title">
                                            <div class="graph_legend" style="background-color: ${labels_colors[i]}"></div>
                                            ${labels[i]}
                                        </div>
                                        <div>${formatNum(parseInt(element))}</div>
                                    </div>`
            });
            table_data += ` <div class="workspace_row" >
                                    <div class="title">Total</div>
                                    <div>${formatNum(table_data_sum)}</div>
                            </div>`
            //console.log("div_id ", div_id)
            document.getElementById(div_id).innerHTML = table_data
            var ctx = document.getElementById(div_id.replace('table', 'graph')).getContext('2d');
            var gradient12 = ctx.createRadialGradient(115, 115, 0, 115, 115, 115);
            gradient12.addColorStop(0, "#FDDE0F");
            gradient12.addColorStop(0.9, "#F36809");
            var gradient34 = ctx.createRadialGradient(115, 115, 0, 115, 115, 115);
            gradient34.addColorStop(0, "#2082D6");
            gradient34.addColorStop(0.9, "#915FCE");
            var gradient55 = ctx.createRadialGradient(115, 115, 0, 115, 115, 115);
            gradient55.addColorStop(0, "#3CDCDA");
            gradient55.addColorStop(0.9, "#17E997");

            let graph_data = {
                labels: labels,
                datasets: [
                    {
                        label: '',
                        borderWidth: 0,
                        backgroundColor: [
                            // window.chartColors.order_status_12,
                            // window.chartColors.order_status_34,
                            // window.chartColors.order_status_55
                            gradient12,
                            gradient34,
                            gradient55
                        ] ,
                        data: ordered_graph_data
                    }
                ]
            };

            const options = {
                responsive: false,
                plugins: {
                    title: {
                        display: false
                    },
                    tooltip: {
                        mode: 'point',
                        intersect: false
                    },
                    legend: {display: false},
                },
                radius: 100,
                borderWidth: 0
            }


            if (workspace_manufacturer_graph_orders != null) workspace_manufacturer_graph_orders.destroy()
            workspace_manufacturer_graph_orders = new Chart(ctx, {
                type:    'pie',
                data:    graph_data,
                options: options
            });
        }
    }
    function setWSSupplies(supplies_graph_data, div_id){
        const labels        = ['Collection', 'En route', 'Unpaid deliveries']
        const labels_colors = [window.chartColors.order_status_6, window.chartColors.order_status_7, window.chartColors.order_status_10]

        let table_data_sum = 0
        let table_data = ``
        if (supplies_graph_data.every(element => element == 0)) {
            if (workspace_manufacturer_graph_supplies != null) workspace_manufacturer_graph_supplies.destroy()
            noDataGraph(supplies_graph_data, document.getElementById(div_id), labels)

        } else {
            supplies_graph_data.forEach(function(element, i) {
                table_data_sum += parseInt(element)
                table_data += ` <div class="workspace_row">
                                        <div class="title">
                                            <div class="graph_legend" style="background-color: ${labels_colors[i]}"></div>
                                            ${labels[i]}
                                        </div>
                                        <div>${formatNum(parseInt(element))}</div>
                                    </div>`
            });
            table_data += `<div class="workspace_row" >
                                    <div class="title">Total</div>
                                    <div>${formatNum(parseInt(table_data_sum))}</div>
                                </div>`

            document.getElementById(div_id).innerHTML = table_data
            var ctx = document.getElementById(div_id.replace('table', 'graph')).getContext('2d')


            var gradient6 = ctx.createRadialGradient(115, 115, 0, 115, 115, 115);
            gradient6.addColorStop(0, "#FD810F");
            gradient6.addColorStop(0.9, "#C6450E");
            var gradient7 = ctx.createRadialGradient(115, 115, 0, 115, 115, 115);
            gradient7.addColorStop(0, "#00DDDA");
            gradient7.addColorStop(0.9, "#00AC69");
            var gradient8 = ctx.createRadialGradient(115, 115, 0, 115, 115, 115);
            gradient8.addColorStop(0, "#EA07E2");
            gradient8.addColorStop(0.9, "#A50B83");
            let graph_data = {
                labels: labels,
                datasets: [
                    {
                        label: '',
                        borderWidth: 0,
                        backgroundColor: [
                            // window.chartColors.order_status_6,
                            // window.chartColors.order_status_7,
                            // window.chartColors.order_status_8
                            gradient6,
                            gradient7,
                            gradient8
                        ] ,
                        data: supplies_graph_data
                    }
                ]
            };



            const options = {
                responsive: false,
                plugins: {
                    title: {
                        display: false
                    },
                    tooltip: {
                        mode: 'point',
                        intersect: false
                    },
                    legend: {display: false},
                },
                radius: 100,
                borderWidth: 0
            }

            if (workspace_manufacturer_graph_supplies != null) workspace_manufacturer_graph_supplies.destroy()
            workspace_manufacturer_graph_supplies = new Chart(ctx, {
                type:    'pie',
                data:    graph_data,
                options: options
            });
        }
    }
    function setWSProjects(project_data, div_id){
        const labels        = ['Presentation', 'Offer', 'Testing']
        const labels_colors = [window.chartColors.project_status_2, window.chartColors.project_status_3, window.chartColors.project_status_4]

        let table_data_sum = 0
        let table_data = ``

        if (project_data.every(element => element == 0)) {
            if (workspace_graph_projects != null) workspace_graph_projects.destroy()
            noDataGraph(project_data, document.getElementById(div_id), labels)
        } else {
            project_data.forEach(function(element, i) {
                table_data_sum += element
                table_data += ` <div class="workspace_row">
                                        <div class="title">
                                            <div class="graph_legend" style="background-color: ${labels_colors[i]}"></div>
                                            ${labels[i]}
                                        </div>
                                        <div>${element}</div>
                                    </div>`
            });
            table_data += `<div class="workspace_row" >
                                    <div class="title">Total</div>
                                    <div>${table_data_sum}</div>
                                </div>`




            const options = {
                responsive: false,
                plugins: {
                    title: {
                        display: false
                    },
                    tooltip: {
                        mode: 'point',
                        intersect: false
                    },
                    legend: {display: false},
                },
                radius: 100,
                borderWidth: 0
            }

            document.getElementById(div_id).innerHTML = table_data

            var ctx = document.getElementById(div_id.replace('table', 'graph')).getContext('2d');
            var gradient2 = ctx.createRadialGradient(115, 115, 0, 115, 115, 115);
            gradient2.addColorStop(0, "#E7CB00");
            gradient2.addColorStop(0.9, "#94BD06");
            var gradient3 = ctx.createRadialGradient(115, 115, 0, 115, 115, 115);
            gradient3.addColorStop(0, "#EA07E2");
            gradient3.addColorStop(0.9, "#A50B83");
            var gradient4 = ctx.createRadialGradient(115, 115, 0, 115, 115, 115);
            gradient4.addColorStop(0, "#B30FF6");
            gradient4.addColorStop(0.9, "#740EC7");
            let graph_data = {
                labels: labels,
                datasets: [
                    {
                        label: '',
                        borderWidth: 0,
                        backgroundColor: [
                            // window.chartColors.project_status_2,
                            // window.chartColors.project_status_3,
                            // window.chartColors.project_status_4
                            gradient2,
                            gradient3,
                            gradient4

                        ] ,
                        data: project_data
                    }
                ]
            };



            if (workspace_graph_projects != null) workspace_graph_projects.destroy()
            workspace_graph_projects = new Chart(ctx, {
                type:    'pie',
                data:    graph_data,
                options: options
            });
        }
    }


    ///// -MANAGE WORKSPACE /////








    ///// + MANAGE PRODUCTS ////
    function setProductsList(products, cabinet_info) {
        products_data = products

        if (user_status == "manufacturer"){
            return
        }

        let height_vh = 66
        if (main_data.buyer_manufacturers.length <= 1) { height_vh += 4  }

        Array.from(document.getElementsByClassName("list-base-products")).forEach(function(element) {
            element.style.maxHeight = `${height_vh}vh`
        })



        let result = ''
        products.forEach(function(item, i, arr) {
            if (item.manufacturer_id != buyer_manufacturer.id) {
                return
            }

            if (product_filter_industry != '' && product_filter_industry != item.industry) {
                return
            }

            let link          = `https://yourpartners.net/certificates/specs/${item.name}.pdf`
            if (item.name.includes("Product ")){
                link          = `https://yourpartners.net/certificates/specs/empty.pdf`
            }

            let price         = ''
            let tippy         = ''
            let incoterm_code = buyer_manufacturer.base_incoterm
            if (isNaN(item[`price_${incoterm_code}`])) {
                price = 'No price'
                tippy = 'Place order to request price'
            } else {
                price = parseFloat(item[`price_${incoterm_code}`]).toFixed(2)
                price += ` ${cabinet_info.base_currency}`
                tippy = `${price}  ${incoterm_code}`
            }


            result += `
                    <div class="list-base-product" data-product-id="${item.id}">
                        <div class="main_info get_product_detail">
                            <div class="name">
                                ${item.name}

                            </div>

                            <div class="main_btns">
                                <img src="img/info.svg" class="get_product_detail info_img"/>
                                <div class="btns_to_cart action-btn">order</div>
                            </div>
                        </div>

                        <div class="details_info" >
                            <div class="product_price">${tippy}</div>
                            <div class="product_description description">${item.description}</div>

                            <div class='links'>
                              <div><img class='link_img' src='img/link_pdf.svg' /><a href='${link}' target='_blank'>Specification</a></div>
                            </div>
                        </div>

                    </div>
            `
        });

        Array.from(document.getElementsByClassName("list-base-products")).forEach(function(element) {
            element.innerHTML = result
        });

        Array.from(document.querySelectorAll("#order_kg")).forEach(function(element) {
            element.addEventListener('input', changeProductCountKeyboard );
            element.addEventListener("keyup", function(event) {
                event.preventDefault();
                if (event.keyCode === 13) {
                    element.parentElement.parentElement.getElementsByClassName('btns_to_cart')[0].click();
                }
            })
        });

        Array.from(document.getElementsByClassName("btns_to_cart")).forEach(function(element) {
            element.addEventListener('click', setOrderKG );
            // element.addEventListener('click', productToCart );
        });
        Array.from(document.getElementsByClassName("get_product_detail")).forEach(function(element) {
            element.addEventListener('click', showProductDetail );
        });

    }
    function setOrderKG(evt){
        evt.preventDefault()
        evt.stopPropagation()
        const product_id = this.parentElement.parentElement.parentElement.getAttribute("data-product-id")
        document.getElementById('btn_add_to_cart').setAttribute("data-product-id", product_id)
        showPopup("select_order_kg")
    }

    document.getElementById('btn_add_to_cart').addEventListener('click', function(evt){
        evt.preventDefault()
        evt.stopPropagation()

        const product_id = this.getAttribute("data-product-id")
        let   product_kg = parseInt(document.getElementById('order_kg').value)
        const product_data = products_data.find(item => item.id === parseInt(product_id))
        const min_count  = product_data.min_count

        console.log("product_data " + product_data)
        console.log("product_kg " + product_kg)

        if (product_kg == 0 ) {
            showAlert("Enter weight of the item")
            return;
        }

        const tail = product_kg % min_count
        if (tail != 0) {
            product_kg = Math.floor(product_kg/min_count) * min_count + min_count
        }
        console.log("product_kg " + product_kg)



        Array.from(cart).forEach(function(element, index) {
            if (element.id === parseInt(product_id)){
                cart.splice(index, 1);
            }
        });
        let product_count = product_kg + ' kg'

        console.log("product_count ", product_count)
        let product_to_cart = products_data.find(item => item.id === parseInt(product_id))
        product_to_cart.counts = [product_count]
        console.log("product_to_cart ", typeof product_to_cart)
        cart.push(product_to_cart)
        console.log("cart " + cart)
        updateCart(cart)

        closePopup()
    })

    function showProductDetail(evt){
        evt.preventDefault()
        evt.stopPropagation()

        console.log("click")
        let parent_element = ''
        let visible = false

        if (this.classList.contains('info_img')) {
            parent_element = this.parentElement.parentElement.parentElement
        } else {
            parent_element = this.parentElement
        }

        visible = parent_element.getElementsByClassName('details_info')[0].style.display === 'block'
        Array.from(document.getElementsByClassName("details_info")).forEach(function(element) {
            element.style.display = 'none'
        });

        if (!visible) {
            parent_element.getElementsByClassName('details_info')[0].style.display = 'block'
        }
    }

    function changeProductCountBtns() {
        let input = this.parentElement.querySelector('.value')
        let product_id = this.parentElement.parentElement.getAttribute("data-product-id")


        console.log("input " + input.value)
        console.log("product_id " + product_id)
        const step = products_data.find(item => item.id === parseInt(product_id)).min_count
        let value = parseInt(input.value)
        console.log("input typeof " + ( typeof input.value))

        if (isNaN(input.value) || input.value === '') {value = step}
        if (this.classList[0] === "minus") {
            const new_value = value - step
            input.value = `${new_value <= 0 ? step : new_value}`
        } else {
            input.value = `${value + step}`
        }
    }
    let input_timeout = setTimeout(() => {}, 100);
    function changeProductCountKeyboard() {
        let input = this
        let product_id = this.parentElement.querySelector("#btn_add_to_cart").getAttribute("data-product-id")

        const step = products_data.find(item => item.id === parseInt(product_id)).min_count

        const tail = parseInt(input.value) % step
        clearTimeout(input_timeout)
        input_timeout = setTimeout(() => {
            if (tail != 0) {

                let new_value = parseInt(input.value) + (step - tail)
                new_value = new_value < 1 ? 25 : new_value
                input.value = `${new_value <= 0 || isNaN(new_value) ? step : new_value}`

            }

        }, 1000)
    }


    Array.from(document.getElementsByClassName("icon_cart_top")).forEach(function(element) {
        element.addEventListener('click', openCart )
    });
    function openCart(){
        showPopup("order_cart")
    }

    function deleteProduct() {

        let position = this.getAttribute("data-position")
        console.log("deleteProduct position", position)

        console.log("cart before", cart)
        cart = cart.filter(function(item, i) {
            return i !== parseInt(position);
        });

        console.log("cart after", cart)

        updateCart(cart)
    }

    function updateBadge(cart_size){
        Array.from(document.getElementsByClassName("icon_cart_top")).forEach(function(element) {
            element.querySelector(".badge").innerText = cart_size
            element.style.display = cart_size == 0 ? "none" : "block"
        })
    }
    function updateCart(inside_cart){
        console.log("updateCart")
        setCookie(cookie_cart_name, JSON.stringify(cart), 3600)

        updateBadge(inside_cart.length)



        let cart_list_html = ''
        let cart_to_order_html = ''


        let total_tons = 0
        inside_cart.forEach(function(item, i, arr) {
            console.log(item )
            let tons = parseInt(item.counts[0])
            total_tons += tons
            cart_list_html += `<div class="cart-product">
                                <div class="text_info">
                                    <div class="name">${item.name}</div>
                                </div>

                                <div class="actions">
                                    <div class="name count">${formatNum(tons)} kg</div>
                                    <img data-position="${i}" class="delete_product close_img" src="img/close.svg"/>
                                </div>
                            </div>`
            cart_to_order_html += `<div class="cart-product">


                                <div class="text_info">
                                    <div class="name">${item.name}</div>
                                </div>

                                <div class="tons">${formatNum(tons)} kg  </div>
                            </div>`


        });



        cart_results = []


        let cart_text = `Total: ${formatNum(total_tons)} kg`
        let btns_display = 'block'
        let cart_list_display = 'block'
        if (inside_cart.length === 0) {
            cart_list_display = 'none'
            cart_text = 'Order list is empty'
            btns_display = 'none'
        }


        // #document.getElementById('cart_to_order').innerHTML = cart_to_order_html

        Array.from(document.getElementsByClassName("cart_work_space")).forEach(function(element) {
            element.innerHTML = cart_list_html
        });

        Array.from(document.getElementsByClassName("delete_product")).forEach(function(element) {
            element.addEventListener('click', deleteProduct );
        });

        Array.from(document.getElementsByClassName("cart-list")).forEach(function(element) {
            element.style.display = cart_list_display
        });
        Array.from(document.getElementsByClassName("cart_text")).forEach(function(element) {
            element.innerHTML = cart_text
        });
        Array.from(document.getElementsByClassName("div_cart_btns")).forEach(function(element) {
            element.style.display = btns_display
        });
    }


    function setProductsManufacturerFilter(){

        let manufacturer_id = getCookie(cookie_manufacturer_products)
        if (typeof manufacturer_id == 'undefined' || manufacturer_id == 'undefined') {
            manufacturer_id = main_data.buyer_manufacturers[0].id
        }
        buyer_manufacturer = main_data.buyer_manufacturers.filter(manufacturer => {return manufacturer.id == manufacturer_id})[0]

        if (main_data.buyer_manufacturers.length <= 1) {
            document.getElementById("filter_manufacturers_products").style.display = 'none'
            document.getElementById("filter_analytic_buyer_manufacturers").style.display = 'none'
            document.getElementById("filter_price_list_buyer_manufacturers").style.display = 'none'
        } else {
            document.getElementById("filter_manufacturers_products").display = 'block'
            document.getElementById("filter_manufacturers_products").innerText = buyer_manufacturer.name

            document.getElementById("filter_analytic_buyer_manufacturers").display = 'block'
            document.getElementById("filter_analytic_buyer_manufacturers").innerText = buyer_manufacturer.name

            document.getElementById("filter_price_list_buyer_manufacturers").display = 'block'
            document.getElementById("filter_price_list_buyer_manufacturers").innerText = buyer_manufacturer.name

            // Создаем попап с выбором производителя
            let html = ""
            main_data.buyer_manufacturers.forEach(item => {
                html += `<div class="buyer_manufacturers_list vertical_list_item" data-manufacturer-id="${item.id}">${item.name}</div>`
            })
            document.getElementById('list_manufacturers').innerHTML = html
            Array.from(document.getElementsByClassName("buyer_manufacturers_list")).forEach(function(element) {
                element.addEventListener('click', changeManufacturerBuyer )
            });

            function changeManufacturerBuyer(){
                manufacturer_id = parseInt(this.getAttribute("data-manufacturer-id"))
                buyer_manufacturer = main_data.buyer_manufacturers.filter(manufacturer => {return manufacturer.id == manufacturer_id})[0]
                document.getElementById("filter_manufacturers_products").innerText = buyer_manufacturer.name
                document.getElementById("filter_analytic_buyer_manufacturers").innerText = buyer_manufacturer.name
                document.getElementById("filter_price_list_buyer_manufacturers").innerText = buyer_manufacturer.name

                Array.from(document.querySelectorAll(".products_filter_industry")).forEach(function(element) {
                    element.classList.remove('active')
                })
                product_filter_industry = ''
                setProductsFilters()

                deleteCookie(cookie_cart_name)
                cart = []
                updateCart(cart)

                setCookie(cookie_manufacturer_products, manufacturer_id)
                setProductsList(main_data.products, main_data.cabinet_info)
                closePopup()

                document.getElementById('div_buyer_analytic_container').style.display = 'none'
                document.getElementById('div_btn_buyer_analytic_filter').style.display = 'block'

                createAnalyticFilterProducts()



                setBuyerPriceList()
            }
        }
    }

    function setProductsFilters(){
        let last_element = ''
        Array.from(document.querySelectorAll('.div_products_filter .products_filter_industry')).forEach(function(element) {

            if (buyer_manufacturer.industries.includes(element.getAttribute("data-key"))){
                element.style.display = 'flex'
                element.style.marginRight = "15px"
                last_element = element.getAttribute("data-key")
            } else {
                element.style.display = 'none'
            }
        })

        Array.from(document.querySelectorAll(`.div_products_filter .products_filter_industry[data-key="${last_element}"]`)).forEach(function(element) {
            element.style.marginRight = "0px"
        })
    }
    function getProductsList(products) {
        products_short = []
        products.forEach(function(item) {
            products_short.push(item.name);
        });
        return products_short;
    }

    let product_filter_industry = ''
    Array.from(document.querySelectorAll(".products_filter_industry")).forEach(function(element) {
        element.addEventListener('click', filterProducts );
    })
    function filterProducts(){
        let keys = this.getAttribute("data-key")
        let active = this.classList.contains("active")
        product_filter_industry = keys


        if (this.classList.contains("active")) {
            product_filter_industry = ''
        }

        setProductsList(main_data.products, main_data.cabinet_info)
        Array.from(document.querySelectorAll(".products_filter_industry")).forEach(function(element) {
            element.classList.remove('active')
        });
        if (!active) {
            this.classList.add("active")
        }
    }
    document.getElementById('input_search_ingredients').addEventListener('input', function(){

        let product_list = main_data.products
        const search_value = this.value.toLowerCase()
        if (product_filter_industry === '') {
            product_list = main_data.products.filter(function(item, i) {return item.name.toLowerCase().includes(search_value)})
        } else {
            product_list = main_data.products.filter(function(item, i) {return product_filter_industry.split(",").includes(item.industry)})
            product_list = product_list.filter(function(item, i) {return item.name.toLowerCase().includes(search_value)})
        }

        setProductsList(product_list, main_data.cabinet_info)
    })


    document.getElementById('filter_manufacturers_products').addEventListener('click', function(){
        showPopup("change_manufacturer")
    })
    document.getElementById('filter_analytic_buyer_manufacturers').addEventListener('click', function(){
        showPopup("change_manufacturer")
    })
    document.getElementById('filter_price_list_buyer_manufacturers').addEventListener('click', function(){
        showPopup("change_manufacturer")
    })

    let order_inside_cart = []
    let order_in_popup = []
    let max_days_to_produce = 30
    function showPopupCart(inside_cart, order, who_open, show_price) {
        max_days_to_produce = 30
        order_inside_cart = inside_cart
        order_in_popup = order
        console.log("who_open ", who_open)
        console.log("order ", order)
        console.log("inside_cart ", inside_cart)

        let total_kilos_first = 0
        let total_kilos_last  = 0

        let hidden_action_btns = `<div class="actions-btns" style="visibility: hidden;">
                                    <img  class="" src="img/check.svg"/>
                                    <img  class="order_change"  src="img/edit.svg"/>
                                  </div>`

        let has_unstated_price = false
        let cart_order = document.getElementById('user_cart_order_list')
        cart_order.style.display = 'block'
        cart_order.innerHTML = ""
        inside_cart.forEach(function(item, i, arr) {
            console.log("inside_cart item ", item)


            let counts_first = item.counts[0]
            let counts_last  = item.counts[item.counts.length - 1]
            total_kilos_first += parseInt(counts_first)
            total_kilos_last  += parseInt(counts_last)


            let numbers_actions = `<div class="actions in_popup" data-product-id="${item.id}" data-order-id="${order.id}">`
            if (show_price){
                if (product_prices[i] == 10000 || product_prices[i] == 0 ) {
                    numbers_actions += `<div class="name count base"   data-tippy-content="${order_conditions.incoterm} price calculation in process">In process</div>`
                    has_unstated_price = true
                } else {
                    numbers_actions += `<div class="count base"   data-tippy-content="Price">${parseFloat(product_prices[i]).toFixed(2)}</div>`
                }
            }
            numbers_actions += `<div class="count base"           data-tippy-content="Base value">${formatNum(counts_first)}</div>`
            numbers_actions += '</div>'


            let info_img_src = "img/info.svg"
            let info_days = item.produced_days
            if (item.produced_days > 30) {
                info_img_src = "img/info_blue.svg"
                max_days_to_produce = item.produced_days
            }


            cart_order.innerHTML += `<div class="cart-product order-product" data-product-id="${item.id}">
                                        <div class="text_info">
                                            <img class="info_img info_img_product" src="${info_img_src}" data-tippy-content="Production time ~${info_days} days" />
                                            <div ">${item.name}</div>
                                        </div>
                                        ${numbers_actions}
                                      </div>`


        });
        total_kilos_first += ' kg'
        total_kilos_last  += ' kg'


        let total_line = `<div class="actions">`

        total_line += `<div id="order_price_first" class="count base" data-tippy-content="Total cost"></div>`
        total_line += `<div class="count base" data-tippy-content="Total weight">${formatNum(total_kilos_first)}</div>`
        total_line += `</div>`

        cart_order.innerHTML += `<div class="order_divider"></div>`
        cart_order.innerHTML +=  `<div class="cart-product order-product" >
                                        <div class="text_info">
                                            <div class="name">Total</div>
                                        </div>
                                        ${total_line}
                                      </div>`

        if (show_price) {
            getCartCost(inside_cart)
            getCartDeliveryDate(order_conditions)
        }

        let btn_text = 'PLACE ORDER'
        if (has_unstated_price){
            btn_text = 'PRE-REQUEST'
        }
        document.getElementById(`btn_create_order`).style.visibility = 'visible'
        document.getElementById(`btn_create_order`).innerText = btn_text

        Array.from(document.getElementsByClassName("country_flag")).forEach(function(element) {
            element.setAttribute("data-tippy-content", "Destination country")
        });

        Array.from(document.getElementsByClassName("order_approve")).forEach(function(element) {
            element.setAttribute("data-tippy-content", "Подтверждение значения")
            element.addEventListener('click', orderProductApprove );
        });
        Array.from(document.getElementsByClassName("order_change")).forEach(function(element) {
            element.setAttribute("data-tippy-content", "Отправить изменения")
            element.addEventListener('click', orderProductChange );
        });

        tippy('.count, .order_input_value, .order_approve, .order_send,  .country_flag, .info_img_product', {
            content: 'My tooltip!',
            followCursor: 'horizontal',
            animation: 'fade',
        });
    }
    function getCartCost(cart){
        fetch(
            `${api_url}calculate_order_cost_inside`,
            { method: 'post',
                body: JSON.stringify({
                    cart: cart,
                    conditions: order_conditions
                }),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                if (json.calculation.cost == 0) {
                    document.getElementById(`order_price_first`).innerHTML = ` - `
                } else {
                    document.getElementById(`order_price_first`).innerHTML = `${json.calculation.currency} ${formatNum(parseFloat(json.calculation.cost).toFixed(0))  }`

                }
            })
            .catch( error => console.error('error:', error) );
    }
    function getCartDeliveryDate(conditions){

        var today = new Date();
        var target_date = new Date();

        let text = ''
        let icon = ''

        let delivery_time = main_data.incoterms.find(item => item.incoterm_name === conditions.incoterm).lead_time
        if (delivery_time == 0) {
            text = 'Nearest term of readiness'
        } else {
            text = 'Nearest delivery time to port'
            const icon_text = `Production time: ~${max_days_to_produce} days. Delivery time: ~${delivery_time} days`
            icon = `<img id="icon_order_info" src="img/info.svg" data-tippy-content="${icon_text}" />`
            max_days_to_produce += delivery_time
        }


        target_date.setDate(today.getDate() + max_days_to_produce);
        document.getElementById(`order_date_delivery`).style.display = 'block'
        document.getElementById(`order_date_delivery`).innerHTML = `${text} ${getFormattedDate(target_date)} ${icon}`

        tippy('#icon_order_info', {
            followCursor: 'horizontal',
            animation: 'fade',
        });
    }


    ///// - MANAGE PRODUCTS ////






    ///// + CREATE ORDER ////
    let product_prices = []
    Array.from(document.getElementsByClassName("btn_to_calculate")).forEach(function(element) {
        element.addEventListener('click', showPopupOrderConditions );
    });

    let order_conditions = {
        country: '',
        currency: '',
        incoterm:    "",

        pickup: '',
        supply: "",

        prepay: "",
        delay:  ""}
    function showPopupOrderConditions(){


        order_conditions.country  = ''
        order_conditions.incoterm      = ''
        order_conditions.currency = ''
        order_conditions.pickup   = ''
        order_conditions.supply   = ''

        const div_order_countries = document.getElementById('div_order_countries')
        const div_order_incoterms = document.getElementById('div_order_incoterms')
        const div_order_currency  = document.getElementById('div_order_currency')
        const div_order_pickup    = document.getElementById('div_order_pickup')

        div_order_countries.style.display = 'none'
        div_order_incoterms.style.display = 'none'
        div_order_currency .style.display = 'none'
        div_order_pickup   .style.display = 'none'

        console.log("buyer.countries.length  ", buyer.countries.length)

        if (buyer.countries.length  == 1) {
            order_conditions.country = buyer.countries[0].country_name
            div_order_incoterms.style.display = 'block'
        } else {
            div_order_countries.style.display = 'block'
        }
        if (buyer.incoterms.length  == 1) {order_conditions.incoterm = buyer.incoterms[0]}
        if (buyer.currencies.length == 1) {order_conditions.currency = buyer.currencies[0]}

        setAvailableIncoterms(buyer_manufacturer.incoterms)
        showPopup("order_conditions")
    }

    function selectCountry(){
        order_conditions.country = this.getAttribute("data-value")
        document.getElementById('div_order_countries').style.display = 'none'
        if (order_conditions.incoterm == '') {
            document.getElementById('div_order_incoterms').style.display = 'block'
        } else if (order_conditions.currency == '') {
            document.getElementById('div_order_currency').style.display = 'block'
        } else {
            document.getElementById('div_order_pickup').style.display = 'block'
        }
        console.log("selectCountry order_conditions ", order_conditions)

        Array.from(document.getElementsByClassName("selector-product-incoterm")).forEach(function(element) {
            const element_incoterm = element.getAttribute("data-value")
            let display = 'none'
            incoterms.forEach(function(incoterm) {
                if (element_incoterm == incoterm.incoterm_name) {
                    //if (incoterm.country_name == 'China') {
                    display = 'block'
                    //} else if (incoterm.incoterm_name == element_incoterm && incoterm.country_name == order_conditions.country) {
                    //    display = 'block'
                    //}
                }
            })
            element.style.display = display
        })
    }

    function selectProductIncoterm(){
        order_conditions.incoterm = this.getAttribute("data-value")
        document.getElementById('div_order_incoterms').style.display = 'none'
        if (order_conditions.currency == '') {
            document.getElementById('div_order_currency').style.display = 'block'
        } else {
            document.getElementById('div_order_pickup').style.display = 'block'
        }

        //document.getElementById('user_order_incoterm').innerHTML = `<img src="img/check.svg">Incoterms: ${order_conditions.incoterm}`
        //document.getElementById('user_order_incoterm').style.textDecoration = `none`
//
        //tryCalculateCart()
        //document.querySelectorAll("[data-popup-name=product_incoterm]")[0].style.display = 'none'
    }

    function selectCurrency(){
        order_conditions.currency = this.getAttribute("data-value")
        document.getElementById('div_order_currency').style.display = 'none'
        document.getElementById('div_order_pickup').style.display = 'block'
        //document.getElementById('user_order_currency').innerHTML = `<img src="img/check.svg">Currency: ${order_conditions.currency}`
        //document.getElementById('user_order_currency').style.textDecoration = `none`
//
        //Array.from(document.querySelectorAll(".selector-product-currency")).forEach(function(element) {
        //    element.classList.remove('active')
        //});
        //this.classList.add('active')
        //tryCalculateCart()
        //document.querySelectorAll("[data-popup-name=product_currency]")[0].style.display = 'none'

    }
    function selectPickup(){
        order_conditions.pickup = this.getAttribute("data-value")

        document.getElementById('user_order_pickup').innerHTML = `<img src="img/check.svg">Expected pickup date ${this.innerText}`
        closePopup()
        showPopupOrder(false, "user", {status: 0}, order_conditions, cart)

        document.getElementById(`btn_create_order`).style.visibility = 'hidden'
    }

    function showPopupOrder(show_price, who_open, order, conditions, cart) {
        //order_conditions.supply = buyer.supplies[0]

        showPopup("user_order")
        document.getElementById('user_order_to_country').innerHTML = `<img src="img/check.svg">Delivery to ${order_conditions.country}`
        document.getElementById('user_order_incoterm').innerHTML = `<img src="img/check.svg">Incoterm: ${order_conditions.incoterm}`
        document.getElementById('user_order_currency').innerHTML = `<img src="img/check.svg">Currency: ${order_conditions.currency}`
        getCartDeliveryDate(conditions)

        showPopupCart(cart, order, who_open, show_price)

        if (show_price) {
            return
        } else {
            tryCalculateCart()
        }
        return


        order_conditions.country  = ''
        order_conditions.currency = ''
        order_conditions.incoterm      = ''
        order_conditions.pickup   = ''

        var today = new Date();
        var target_date = new Date();
        target_date.setDate(today.getDate() + 14);



        document.getElementById(`order_date_delivery`).style.display = 'none'

        document.getElementById('user_order_to_country').innerHTML = `<img src="img/check.svg">Set destination country`
        document.getElementById('user_order_incoterm').innerHTML = `<img src="img/check.svg">Set incoterms`
        document.getElementById('user_order_currency').innerHTML = `<img src="img/check.svg">Set currency`
        document.getElementById('user_order_pickup').innerHTML = `<img src="img/check.svg">Set expected pickup date`

        document.getElementById('user_order_to_country').style.textDecoration = `underline`
        document.getElementById('user_order_incoterm').style.textDecoration = `underline`
        document.getElementById('user_order_currency').style.textDecoration = `underline`
        document.getElementById('user_order_pickup').style.textDecoration = `underline`


        document.getElementById('order_date_delivery').innerText = `Срок готовности/доставки: после указания все деталей`


        Array.from(document.querySelectorAll(".selector-product-currency")).forEach(function(element) {
            element.classList.remove('active')
        });

        Array.from(document.querySelectorAll(".popups")).forEach(function(element) {
            element.style.display = 'none'
            if (element.getAttribute("data-popup-name") === "user_order" ) {
                element.style.display = 'flex'
            }
        });
        document.getElementById(`popup_background`).style.display = 'flex'
        document.getElementById(`product_message_send`).setAttribute("data-order-id", order.id)
        document.getElementById(`btn_change_order`).setAttribute("data-order-id", order.id)
        document.getElementById(`btn_order_save_changes`).setAttribute("data-order-id", order.id)


        document.getElementsByClassName('user_order_contact_items')[0].style.display = 'block'
        document.getElementById(`btn_create_order`).style.display = 'block'



        document.getElementById(`btn_change_order`).style.display = 'none'
        if (who_open === "admin" && order.status > 2) {
            document.getElementById(`btn_change_order`).style.display = 'block'
        }



        document.getElementById(`user_order_condition_supply`).innerHTML = `<img src="img/check.svg">`
        document.getElementById(`user_order_condition_incoterm`)   .innerHTML = `<img src="img/check.svg">`
        document.getElementById(`user_order_condition_prepay`).innerHTML = `<img src="img/check.svg">`
        document.getElementById(`user_order_condition_delay`) .innerHTML = `<img src="img/check.svg">`

        document.getElementById(`user_order_condition_supply`).innerHTML += getSupplyName(conditions.supply)
        document.getElementById(`user_order_condition_incoterm`)   .innerHTML += conditions.incoterm
        document.getElementById(`user_order_condition_prepay`).innerHTML += conditions.prepay === "0" ? "CAD" : `${conditions.prepay}% предоплата`
        document.getElementById(`user_order_condition_delay`) .innerHTML += `${conditions.delay} дней отсрочка`
        document.getElementById(`user_order_condition_delay`).style.visibility = conditions.delay === 0 ? 'hidden' : 'visible'

    }


    function tryCalculateCart(){
        if (order_conditions.country !== '' && order_conditions.currency !== '' && order_conditions.incoterm !== '') {
            calculateOrderCost(true)
        }
    }
    function calculateOrderCost(show_price){
        fetch(
            `${api_url}calculate_order_cost`,
            { method: 'post',
                body: JSON.stringify({
                    cart: cart,
                    conditions: order_conditions
                }),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                console.log("calculation ", json.calculation)
                cart_results[cart_results.length] = json.calculation
                product_prices = json.calculation.prices
                // showCartResults()
                showPopupOrder(show_price, "user", {status: 0}, order_conditions, cart)
            })
            .catch( error => console.error('error:', error) );
    }



    document.getElementById('btn_create_order').onclick = function(){
        if (order_conditions.country === ``){
            showAlert("Set country of destination")
            return;
        }
        if (order_conditions.incoterm === ''){
            showAlert("Set incoterms")
            return;
        }
        if (order_conditions.currency === ''){
            showAlert("Set currency")
            return;
        }
        if (order_conditions.pickup === ''){
            showAlert("Set pickup date")
            return;
        }
        closePopup()
        saveOrder()

    }

    function saveOrder(){
        fetch(
            `${api_url}save_order`,
            { method: 'post',
                body: JSON.stringify({
                    buyer_id: buyer.organization_id,
                    cart:   cart,
                    conditions: order_conditions
                }),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                //showAlert("Your order has been sent to the manufacturer. Expect a Feedback")
                document.getElementById(`popup_background`).style.display = 'none'
                deleteCookie(cookie_cart_name)
                cart = []
                updateCart(cart)

                let btn_section = ''
                if (user_status == 'buyer') {
                    main_data.ordered_products = json.ordered_products
                    setOrderedProducts(json.ordered_products, "buyer")

                    //changeCurrentPage("orders")

                    btn_section = document.getElementById(`btn_section_ordered`)

                    showNotify("Your order has been sent to manufacturer. Expect a Feedback")
                } else {
                    main_data.ordered_products = json.ordered_products
                    setOrderedProducts(json.ordered_products, "manufacturer")
                    //changeCurrentPage("manufacturer_orders")
                    btn_section = document.getElementById(`btn_section_ordered2`)
                    document.getElementById(`page_manufacturer_order_products`).style.display = 'none'
                    document.getElementById(`page_manufacturer_orders`).style.display = 'flex'

                    showNotify("Order created")
                }

                updateNewMessages()
                if (btn_section.src.includes("show")) {
                    btn_section.click()
                }

            })
            .catch( error => console.error('error:', error) );
    }


    ///// - CREATE ORDER ////











    ///// + MANAGE ORDER ////
    let supply_total_tons = 0
    let supply_total_cash = 0
    function setOrderedProducts(products, who_open){

        if (document.getElementById("div_chat").style.display == 'block') {return}

        main_data.ordered_products = products

        let workspace_buyer_products_html = ""
        let workspace_products_html = ""
        let ordered_products_html = ""
        let produced_products_html = ""
        let manufactured_products_html = ""
        let product_for_delivery_html = ""
        let sended_products_html = ""

        let total = {ordering: {tons: 0, cash: 0}, production: {tons: 0, cash: 0}, ready: {tons: 0, cash: 0}, deliveries: {tons: 0, cash: 0}}
        let messages = {
            ordering:   {new: 0, person: 0, notify: 0},
            production: {new: 0, person: 0, notify: 0},
            ready:      {new: 0, person: 0, notify: 0}
        }

        products.forEach(function(item, i, arr) {
            let counts_last  = item.counts[item.counts.length - 1]
            let html_value = getOrderedProductHtml(item, false)

            if (item.status < 3 ) {
                total.ordering.tons += parseInt(counts_last.replace(/ /g,''))
                total.ordering.cash += item.cost
                messages.ordering.new    += item.new_message_new
                messages.ordering.person += item.new_message_person
                messages.ordering.notify += item.new_message_notify
                ordered_products_html += html_value
            } else if (item.status < 5 ) {
                total.production.tons += parseInt(counts_last.replace(/ /g,''))
                total.production.cash += item.cost
                messages.production.new    += item.new_message_new
                messages.production.person += item.new_message_person
                messages.production.notify += item.new_message_notify
                produced_products_html += html_value
            } else if (item.status === 5 ) {
                if (typeof item.in_delivery != 'undefined' && item.in_delivery) {
                    product_for_delivery_html += html_value
                } else {
                    messages.ready.new    += item.new_message_new
                    messages.ready.person += item.new_message_person
                    messages.ready.notify += item.new_message_notify
                    manufactured_products_html += html_value
                    total.ready.tons += parseInt(counts_last.replace(/ /g,''))
                    total.ready.cash += item.cost
                }
            }// else {
             //
             //   total.deliveries.tons += parseInt(counts_last.replace(/ /g,''))
             //   total.deliveries.cash += item.cost
             //
             //   sended_products_html += html_value
             //}

            let html_desktop_value = getOrderedProductHtml(item, true)
            if (item.in_workspace && user_status == 'manufacturer'){
                if (item.status < 10) {
                    workspace_products_html += html_desktop_value
                }
            }

            if (item.in_workspace && user_status == 'buyer'){
                workspace_buyer_products_html += html_desktop_value
            }
        });


        // Обновляем суммарную информацию в блоках
        let all_products_divs = [
            "div_ordered_products",
            "div_produced_products",
            "div_manufactured_products"
        ]
        let message_types = ["new", "person", "notify"]
        all_products_divs.forEach(function(div, i) {
            Array.from(document.getElementsByClassName(`${div}`)).forEach(function(d) {
                d.style.display = 'block'
                let block_name = ''
                if      (i == 0) {block_name = 'ordering'}
                else if (i == 1) {block_name = 'production'}
                else if (i == 2) {block_name = 'ready'}


                let cash = formatNum(parseInt(total[`${block_name}`].cash))
                let tons = formatNum(parseInt(total[`${block_name}`].tons))
                d.getElementsByClassName("section_musd")[0].innerText = `${cash} USD`
                d.getElementsByClassName("section_mt")[0].innerText   = `${tons} KG`

                message_types.forEach(function(message_type) {
                    let counter = 0
                    if      (i == 0) {counter = messages.ordering[`${message_type}`]}
                    else if (i == 1) {counter = messages.production[`${message_type}`]}
                    else if (i == 2) {counter = messages.ready[`${message_type}`]}

                    let container = d.getElementsByClassName(`section_new_${message_type}`)[0]

                    // TODO убрать ИФ после масштабирования
                    if (typeof container != 'undefined') {
                        container.classList.remove('update_true')
                        container.innerHTML = `<img src="img/${message_type}_${counter > 0}.svg"/>${counter}`
                        if (counter > 0){
                            container.classList.add('update_true')
                        }
                    }
                })
            })
        })

        console.log("order messages ", messages)

        Array.from(document.getElementsByClassName("list-ordered-products")).forEach(function(element) {
            element.innerHTML = ordered_products_html
            visibilityToOrderElement(element, "ordering")
        })
        Array.from(document.getElementsByClassName("list-produced-products")).forEach(function(element) {
            element.innerHTML = produced_products_html
            visibilityToOrderElement(element, "production")
        });
        Array.from(document.getElementsByClassName("list-manufactured-products")).forEach(function(element) {
            element.innerHTML = manufactured_products_html
            visibilityToOrderElement(element, "ready")
        });


        function visibilityToOrderElement(div, message_type){
            let show_full_list = false
            if (messages[`${message_type}`].new == 0 && messages[`${message_type}`].person == 0 && messages[`${message_type}`].notify == 0 ){
                show_full_list = true
            }
            if (show_all_orders_click[`${message_type}`]) {show_full_list = true}

            if (show_full_list) {
                Array.from(div.getElementsByClassName("list-ordered-product")).forEach(function(e) {
                    e.style.display = 'flex'
                })
            }
            div.innerHTML += `<div class="show_all_orders ${show_full_list ? ''  : 'visible'}"><img src="img/show.svg" />SHOW ALL</div>`
        }


        Array.from(document.getElementsByClassName("order_info_main")).forEach(function(element) {
            element.addEventListener('click', showMoreOrderInfo );
        })
        Array.from(document.getElementsByClassName("open_chat_products")).forEach(function(element) {
            element.addEventListener('click', openChatProduct );
        });

        Array.from(document.getElementsByClassName("btns_delete_order")).forEach(function(element) {
            element.addEventListener('click', deleteOrderProduct );
        });
        Array.from(document.getElementsByClassName("remove_from_workspace")).forEach(function(element) {
            element.addEventListener('click', removeFromWorkspace );
        });


        Array.from(document.querySelectorAll(".order_input_value")).forEach(function(element) {
            element.addEventListener('input', changeProductCountOrderKeyboard );
        });
        Array.from(document.getElementsByClassName("order_change")).forEach(function(element) {
            element.addEventListener('click', orderProductChange );
        });
        Array.from(document.getElementsByClassName("order_approve")).forEach(function(element) {
            element.addEventListener('click', orderProductApprove );
        });
        Array.from(document.getElementsByClassName("order_send")).forEach(function(element) {
            element.addEventListener('click', orderProductSend );
        });

        Array.from(document.getElementsByClassName("open_product_calendar")).forEach(function(element) {
            element.addEventListener('click', openProductCalendar );
        });
        Array.from(document.getElementsByClassName("btn_finish_manufacturing")).forEach(function(element) {
            element.addEventListener('click', openPopupFinishManifacturing );
        });
        Array.from(document.getElementsByClassName("btn_change_date")).forEach(function(element) {
            element.addEventListener('click', popupChangeManufacturingDate );
        });
        Array.from(document.getElementsByClassName("btn_divide_order")).forEach(function(element) {
            element.addEventListener('click', openPopupDivideOrder );
        });


        Array.from(document.getElementsByClassName("btn_add_to_delivery")).forEach(function(element) {
            element.addEventListener('click', addToDelivery );
            element.style.display = delivery_formed_active ? "block" : "none"
        })
        Array.from(document.getElementsByClassName("btn_remove_from_delivery")).forEach(function(element) {
            element.addEventListener('click', removeFromDelivery );
        })

        Array.from(document.getElementsByClassName(`show_all_orders`)).forEach(function(element) {
            element.addEventListener('click', showAllOrders)

        })
        function showAllOrders(){
            this.style.display = 'none'
            const orders = this.parentElement.getElementsByClassName(`list-ordered-product`)
            Array.from(orders).forEach(function(element) {
                element.style.display = 'flex'
            })

            const parentClasses = this.parentElement.parentElement.classList
            if (parentClasses.contains('div_ordered_products'))      {show_all_orders_click.ordering = true}
            if (parentClasses.contains('div_produced_products'))     {show_all_orders_click.production = true}
            if (parentClasses.contains('div_manufactured_products')) {show_all_orders_click.ready = true}

            console.log("show_all_orders_click ", show_all_orders_click)
        }

        if (user_status == "manufacturer") {
            document.querySelectorAll(`.graph_type_orders[data-value=${workspace_filter.value_type}]`)[0].click()
            document.querySelectorAll(`.graph_type_supplies[data-value=${workspace_filter.value_type}]`)[0].click()
        }

        setAccesses()

        tippy(`.count, .order_input_value,   .open_chat_products, .country_flag,
               .order_change, .order_approve, .order_send, .btns_delete_order,
               .btn_change_date, .btn_divide_order, .btn_finish_manufacturing, .open_product_calendar,
               .btn_add_to_delivery, .btn_remove_from_delivery, .img_price_null, .dates`, {
            content: 'My tooltip!',
            followCursor: 'horizontal',
            animation: 'fade',
        });

    }

    function getOrderedProductHtml(item, for_desktop){
        let counts_first = item.counts[0]
        let counts_last  = item.counts[item.counts.length - 1]
        let change_direction = countsUpOrDown(item.counts).direction
        let img              = countsUpOrDown(item.counts).img



        let info_dates = ``
        if ([1,2,3].includes(item.status)) {
            info_dates = item.pickup_date
        }

        if (item.status == 4) {
            if (item.date_str !== '') {
                info_dates = item.date_str
            }
        }


        let btn_order_approve = ``
        let btn_order_change = ``
        let btn_order_send = ``

        let btn_calendar = ``
        let btn_finish_manufacturing = ``
        let btn_divide_order = ``
        let btn_change_date = ``
        let btn_delivery = ''
        let btn_delete = ''


        let can_change = ""
        switch (user_status) {
            case "buyer":
                if (item.approve_side === 'buyer') {
                    if (item.status <= 2) { can_change = "can_change" }
                }
                break;

            case "admin":
            case "manufacturer":
                if (item.approve_side === 'manufacturer'){
                    if (item.status <= 2) {  can_change = "can_change"  }
                }
                break;
        }


        let base_tons = ""
        if (item.status <= 2) {
            base_tons = `<div class="name count base ${can_change}">${counts_first}</div>                                `
            if (item.counts.length > 1) {
                base_tons = `<div class="name count new ${can_change} ${change_direction}">${img} ${counts_last}</div>  `
            }
        } else {
            base_tons = `<div class="name count base ${can_change}">${counts_last}</div>   `
        }


        // btn_order_approve = `<div class="order_btn order_approve"><img src="img/confirm.svg"/><div>Confirm size</div></div>`
        // btn_order_change  = `<div class="order_btn order_change"><img src="img/edit_order.svg"/><div>Edit size</div></div>`
        // btn_order_send    = `<div class="order_btn order_send"><img src="img/send_order_changes.svg"/><div>Send new value</div></div>`




        if (user_status === 'manufacturer' || [1,2].includes(item.status)) {
            btn_delete = createOrderBtn("btns_delete_order", "Delete order",  "delete")
        }

        if (item.status === 3 && user_status === 'manufacturer') {
            btn_calendar = createOrderBtn("btn_calendar", "Set ready date",  "calendar_set")
        }



        if (item.status === 4 && user_status === 'manufacturer') {
            btn_change_date          = createOrderBtn("btn_change_date", "Change ready date",  "calendar_change")
            btn_divide_order         = createOrderBtn("btn_divide_order", "Split order",  "split")
            btn_finish_manufacturing = createOrderBtn("btn_finish_manufacturing", "Product is ready",  "confirm")
        }


        if (item.status == 5) {
            if (typeof item.in_delivery != 'undefined' && item.in_delivery) {
                btn_delivery = createOrderBtn("btn_delivery", "Remove from delivery",  "btn_delivery_remove")
            }

            if (typeof item.in_delivery == 'undefined' || !item.in_delivery){
                btn_delivery = createOrderBtn("btn_add_to_delivery", "Add to delivery",  "btn_delivery_add")
            }
        }



        let img_price_null = ''
        if (item.cost == 0) {
            if (user_status === 'manufacturer') {
                img_price_null = `<img class="img_price_null" data-tippy-content="Customer requested price" src="img/achtung.svg"/>`
            } else {
                img_price_null = `<img class="img_price_null" data-tippy-content="Price calculation in process" src="img/achtung_yellow.svg"/>`
            }
        }


        let chat_src ='chat'
        if (item.user_chat_activity) {
            chat_src = 'chat_person'
        }

        let order_visible = false
        if (item.new_message_new > 0 || item.new_message_person > 0 || item.new_message_notify > 0 ) {
            order_visible = true
            chat_src += '_new'
        }
        if (show_all_orders_click.ordering   && item.status <= 2) { order_visible = true }
        else if (show_all_orders_click.production && item.status <= 4) { order_visible = true }
        else if (show_all_orders_click.ready  ) { order_visible = true }

        // let btn_chat = `<img data-new="false" class="open_chat_products"  src="img/${chat_src}.svg" data-tippy-content="Messages"/>`



        let btn_chat =  `<div data-new="false" class="order_btn open_chat_products"><img src="img/${chat_src}.svg"/><div>Messages</div></div>`

        // let html_value = `<div class="list-ordered-product list-order-admin ${item.has_new_status ? 'new_status' : ''} ${order_visible ? 'visible' : ''}"
        //                            data-country="${item.country}"
        //                            data-region="${item.region}"
        //                            data-product-id="${item.id}"
        //                            data-manufacturer-id="${item.manufacturer_id}"
        //                            data-product-cost="${item.cost}"
        //                            data-count="${counts_last}"
        //                            data-product-name="${item.name}"
        //                            data-company-name="${item.client_name}"
        //                            data-produced-days="${item.produced_days}">
        //                                     ${text_info}
        //                                     <div class="created_by_name">${item.created_by_name}</div>
        //
        //                                     ${img_price_null}
        //
        //
        //
        //                                     <div class="hidden_elements">
        //                                          ${btn_delete}
        //
        //                                          ${numbers_actions}
        //                                          ${btn_calendar}
        //
        //                                          ${btn_divide_order}
        //                                          ${btn_change_date}
        //
        //                                          ${btn_finish_manufacturing}
        //
        //                                     </div>
        //                                     ${btn_delivery}
        //                                     ${base_tons}
        //                                     ${dates_value}
        //                                     <div class="visible_elements">
        //                                         ${status_label}
        //                                         ${pickup_date}
        //                                     </div>
        //
        //                                     ${btn_chat}
        //
        //                                 </div>`


        order_visible = true
        let html_value = `  <div class="order_item  ${order_visible ? 'visible' : ''}"
                                   data-country="${item.country}"
                                   data-region="${item.region}"
                                   data-product-id="${item.id}"
                                   data-manufacturer-id="${item.manufacturer_id}"
                                   data-product-cost="${item.cost}"
                                   data-count="${counts_last}"
                                   data-product-name="${item.name}"
                                   data-company-name="${item.client_name}"
                                   data-produced-days="${item.produced_days}">
                            <div class="order_info_main">
                                <div class="status_indicator status color-${item.status}"></div>
                                <div class="order_info_left">
                                    <div class="main_info">
                                        <img class="flag" src="img/flags/${item.country}.svg" />
                                        <div class="order_title">${item.name}</div>
                                    </div>
                                    <div class="secondary_info">
                                        ${user_status === 'manufacturer' ? `${item.client_name} on ` : ''} ${item.incoterm} in ${item.currency}
                                    </div>

                                </div>

                                <div class="order_info_right">
                                    <div class="main_info">
                                        <div class="order_title">${base_tons}</div>
                                    </div>
                                    <div class="secondary_info">
                                        ${info_dates}
                                    </div>

                                </div>
                            </div>
                            <div class="order_updates ${chat_src.includes("new") ? "" : "hidden"}">
                                <div class="container_activity">
                                    <img src="img/notify/notify_true.svg">
                                    <div>New activity</div>
                                </div>

                                <div class="container_more">
                                    <img src="img/actions/dots.svg"/>
                                </div>
                            </div>

                            <div class="order_btns">
                                ${btn_calendar}
                                ${btn_finish_manufacturing}
                                ${btn_divide_order}
                                ${btn_change_date}
                                ${btn_delivery}
                                ${btn_delete}
                                ${btn_chat}
                            </div>
                        </div>
        `

        return html_value
    }
    function createOrderBtn(btn_class, btn_name,  img_src){
        return `<div class="order_btn ${btn_class}"><img src="img/${img_src}.svg"/><div>${btn_name}</div></div>`
    }



    function showMoreOrderInfo(){
        let display   = 'block'

        let div_btns = this.parentElement.querySelector('.order_btns')
        let div_updates = this.parentElement.querySelector('.order_updates')
        if (div_btns.style.display == 'block') {
            display   = 'none'
        }
        div_btns.style.display    = display
        div_updates.style.display =  "none"

        let div_products = this.parentElement.querySelector('.order_info_secondary')
        div_products.style.display = display
    }

    function deleteOrderProduct(){
        const parent = this.parentElement.parentElement

        document.getElementById('btn_delete_order_product').setAttribute("data-product-id", parent.getAttribute("data-product-id"))
        showPopup("delete_order_product")
    }
    document.getElementById('btn_delete_order_product').addEventListener('click', function (evt) {

        sendRequest("POST", "delete_order_product", {product_id: this.getAttribute("data-product-id")})
            .then(data => {
                setOrderedProducts(data.ordered_products, user.organization_type)
                updateNewMessages()
                closePopup()
                updateWorkSpaceAll()
            })
            .catch(err => console.log(err))
    });

    function removeFromWorkspace(e) {
        console.log("removeFromWorkspace this ", this)
        const object_id = this.getAttribute('data-id')
        let empty_text = ''
        let table = null
        let row = null
        switch (this.getAttribute('data-type')){
            case "product":
                empty_text = 'No updates on orders'
                row   = this.parentElement.parentElement
                table = row.parentElement
                row.style.display = 'none'
                break;

            case "supply":
                empty_text = 'No updates on deliveries'
                row   = this.parentElement.parentElement.parentElement
                table = row.parentElement
                row.style.display = 'none'
                break;

            case "project":
                empty_text = 'No updates on projects'
                row   = this.parentElement.parentElement
                table = row.parentElement
                row.style.display = 'none'
                break;
        }

        console.log("row ", row)
        console.log("table ", table)

        let counter = 0
        Array.from(table.children).forEach(function(element) {
            if (element.style.display != 'none') {
                counter += 1
            }
        });

        if (counter == 0) {
            table.innerHTML = `<div class="workspace_no_news">${empty_text}</div>`
        }

        sendRequest('post', 'remove_from_workspace', {object_type: this.getAttribute('data-type'), object_id: this.getAttribute('data-id')} )
            .then(data => {

                showNotify("Hidden")
            })
            .catch(err => console.log(err))

        e.stopPropagation()
    }

    Array.from(document.getElementsByClassName("cart_container")).forEach(function(element) {
        element.style.display = 'none'
    })


    function changeProductCountOrderKeyboard(){

        let input = this
        let product_id = this.parentElement.parentElement.parentElement.getAttribute("data-product-id")

        console.log("product_id ", product_id)
        const step = main_data.ordered_products.find(item => item.id === parseInt(product_id)).min_count

        const tail = parseInt(input.value) % step
        clearTimeout(input_timeout)
        input_timeout = setTimeout(() => {


            const plus = tail == 0 ? 0 : (step - tail)
            const new_value = parseInt(input.value) + plus

            console.log("step ", step)
            console.log("tail ", tail)
            console.log("new_value ", new_value)

            input.value = `${new_value <= 0 || isNaN(new_value) ? step : new_value}`
            input.setSelectionRange(10, 10);

            //input.setSelectionRange(0, 0);

            //let total_kilos = 0
            //Array.from(document.querySelectorAll(".order_input_value")).forEach(function(element) {
            //    if (!element.disabled) {
            //        total_kilos += parseInt(element.value)
            //    }
            //});
            //document.getElementById(`total_line_kilos`).innerHTML = `${total_kilos} kg`
            //getOrderCost(order_inside_cart, "new", order_in_popup.id)

        }, 1500)
    }
    function orderProductChange(){
        let parent = this.parentElement.parentElement
        parent.getElementsByClassName("order_input_value")[0].focus()
        parent.getElementsByClassName("order_input_value")[0].style.display = 'inline-block'

        parent.getElementsByClassName("order_approve")[0].style.display = 'none'
        parent.getElementsByClassName("order_change")[0].style.display  = 'none'
        parent.getElementsByClassName("order_send")[0].style.display    = 'block'
    }

    function orderProductApprove(){
        let parent =  this.parentElement.parentElement.parentElement.parentElement

        //parent.style.display = 'none'

        parent.getElementsByClassName('order_send')[0].click()

        parent.classList.add("animate__animated")
        parent.classList.add("animate__backOutDown")
    }
    function orderProductSend(){
        console.log("send")
        let parent     = this.parentElement.parentElement.parentElement.parentElement
        let product_id = parent.getAttribute('data-product-id')
        let new_value  = parent.querySelectorAll(".order_input_value")[0].value


        console.log("product id ", parent.getAttribute('data-product-id'))

        fetch(
            `${api_url}ordered_product_change_counts`,
            { method: 'post',
                body: JSON.stringify({
                    product_id:  product_id,
                    new_value:   new_value,
                    workspace_filter: workspace_filter
                }),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                showNotify("Changes saved")

                switch (json.who_update){
                    case "buyer":
                        setOrderedProducts(json.ordered_products, "buyer")
                        updateWorkSpaceAll()
                        break;

                    case "admin":
                    case "manufacturer":
                        setOrderedProducts(json.ordered_products, "manufacturer")
                        workspace_data.ordered_products = json.ws_ordered_products
                        //document.querySelectorAll(`.graph_type_orders[data-value=cash]`)[0].click()
                        break;
                }

                updateNewMessages()

            })
            .catch( error => console.error('error:', error) );
    }

    function openProductCalendar(){
        let parent = this.parentElement.parentElement

        const days = parseInt(parent.getAttribute("data-produced-days"))
        document.getElementById('product_save_manufacturing_date').setAttribute("data-product-id",  parent.getAttribute("data-product-id"))
        showPopup("product_calendar")

        var today = new Date();
        var target_date = new Date();

        target_date.setDate(today.getDate() + days);

        document.getElementById('btn_production_days').innerHTML = `+${days} days`
        document.getElementById('btn_production_days').setAttribute("data-days", days)
        document.getElementById('product_manufacturing_date').value = ""
    }


    function openPopupFinishManifacturing(){
        let parent = this.parentElement.parentElement
        showPopup("product_to_produced")
        document.getElementById('product_to_produced').setAttribute("data-product-id", parent.getAttribute("data-product-id"))
    }
    document.getElementById('btn_production_days').addEventListener('click', function(){
        let days = parseInt(this.getAttribute("data-days"))

        var base_date = new Date();
        var target_date = new Date();
        target_date.setDate(base_date.getDate() + days);

        document.getElementById('product_manufacturing_date').value = getFormattedDate(target_date)
    })
    document.getElementById('product_save_manufacturing_date').addEventListener('click', function(){
        let date = document.getElementById('product_manufacturing_date').value
        if (date == "") {
            showAlert("Set date")
            return
        }

        const product_id = this.getAttribute("data-product-id")
        const list = document.getElementById('page_manufacturer_orders').getElementsByClassName('list-produced-products')[0]
        const element = list.querySelectorAll(`[data-product-id="${product_id}"]`)[0]

        element.classList.add("animate__animated")
        element.classList.add("animate__backOutDown")



        fetch(
            `${api_url}product_save_manufacturing_date`,
            { method: 'post',
                body: JSON.stringify({
                    product_id:         this.getAttribute("data-product-id"),// product_id,
                    manufacturing_date: date,
                    workspace_filter:  workspace_filter

                }),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                showNotify("Changes saved")

                setOrderedProducts(json.ordered_products, "manufacturer")
                updateNewMessages()
                closePopup()

                workspace_data.ordered_products = json.ws_ordered_products
                //document.querySelectorAll(".graph_type_orders[data-value=tons]")[0].click()
            })
            .catch( error => console.error('error:', error) );
    })


    document.getElementById('product_to_produced').addEventListener('click', function(){

        const product_id = this.getAttribute("data-product-id")
        const list = document.getElementById('page_manufacturer_orders').getElementsByClassName('list-produced-products')[0]
        const element = list.querySelectorAll(`[data-product-id="${product_id}"]`)[0]

        element.classList.add("animate__animated")
        element.classList.add("animate__backOutDown")


        fetch(
            `${api_url}product_to_produced`,
            { method: 'post',
                body: JSON.stringify({
                    product_id:        this.getAttribute("data-product-id"),
                    workspace_filter:  workspace_filter
                }),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                showNotify("Changes saved")

                setOrderedProducts(json.ordered_products, "manufacturer")
                updateNewMessages()
                closePopup()

                workspace_data.ordered_products = json.ws_ordered_products
                //document.querySelectorAll(".graph_type_orders[data-value=tons]")[0].click()
            })
            .catch( error => console.error('error:', error) );
    })

    function popupChangeManufacturingDate(){
        let parent = this.parentElement.parentElement
        document.getElementById('product_save_manufacturing_date_change').setAttribute("data-product-id",  parent.getAttribute("data-product-id"))

        showPopup("product_calendar_change")
        document.getElementById('product_manufacturing_days_change').value = ''
        document.getElementById('product_manufacturing_date_change').innerHTML = ''
    }
    document.getElementById('product_save_manufacturing_date_change').addEventListener('click', function(){
        fetch(
            `${api_url}product_save_manufacturing_date`,
            { method: 'post',
                body: JSON.stringify({
                    product_id:         this.getAttribute("data-product-id"),// product_id,
                    manufacturing_date: document.getElementById('product_manufacturing_days_change').value,
                    manufacturing_days: "",
                    workspace_filter:  workspace_filter
                }),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                showNotify("Changes saved")
                setOrderedProducts(json.ordered_products, "manufacturer")
                updateNewMessages()
                closePopup()
                workspace_data.ordered_products = json.ws_ordered_products
            })
            .catch( error => console.error('error:', error) );
    })


    let order_divide_base_tons = 0
    function openPopupDivideOrder(){
        let parent = this.parentElement.parentElement
        order_divide_base_tons = parseInt(parent.getAttribute("data-count").replace(" kg", "").replace(" ", ""))
        document.getElementById('divide_order_base').innerHTML = `Base order: ${formatNum(order_divide_base_tons)} kg`
        document.getElementById('divide_order_new').value = ""
        document.getElementById('divide_order_new_date').value = ""
        showPopup("order_divide")
        document.getElementById('btn_order_divide').setAttribute("data-product-id", parent.getAttribute("data-product-id"))
    }
    document.getElementById('divide_order_new').addEventListener('input', function(){
        let new_tons = document.getElementById('divide_order_new').value
        let base_tons = order_divide_base_tons - new_tons
        document.getElementById('divide_order_base').innerHTML = `Base order: ${formatNum(base_tons)} kg`

    })
    document.getElementById('btn_order_divide').addEventListener('click', function(){
        let new_tons = document.getElementById('divide_order_new').value
        let new_tons_date = document.getElementById('divide_order_new_date').value

        if (new_tons > order_divide_base_tons || new_tons <= 0) {
            showNotify("Impossible to split")
            return
        }

        if (new_tons_date == '') {
            showNotify("Set date")
            return
        }


        fetch(
            `${api_url}order_divide`,
            { method: 'post',
                body: JSON.stringify({
                    workspace_filter: workspace_filter,
                    product_id: this.getAttribute("data-product-id"),
                    new_tons:  new_tons,
                    new_tons_date:  new_tons_date,
                }),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                showNotify("Changes saved")
                setOrderedProducts(json.ordered_products, "manufacturer")
                updateNewMessages()
                closePopup()
                workspace_data.ordered_products = json.ws_ordered_products
                //document.querySelectorAll(".graph_type_orders[data-value=tons]")[0].click()
            })
            .catch( error => console.error('error:', error) );
    })


    ///// - MANAGE ORDER ////









    ///// + MANAGE DELIVERY ////
    function addToDelivery(){
        let parent = this.parentElement
        parent.classList.add("animate__animated")
        parent.classList.add("animate__backOutDown")


        showNotify("Product added to delivery")
        setTimeout(function(){
            let product_id = parent.getAttribute("data-product-id")

            main_data.ordered_products.forEach(function(item, i, arr) {
                if (item.id == product_id) { item.in_delivery = true }
            })

            setProductsForDelivery()
        }, 300)
    }
    function removeFromDelivery(){
        console.log("removeFromDelivery")

        let product_id = this.parentElement.parentElement.parentElement.getAttribute("data-product-id")
        console.log("product_id ", product_id)
        main_data.ordered_products.forEach(function(item, i, arr) {
            if (item.id == product_id) { item.in_delivery = false }
        })
        showNotify("Product removed from delivery")
        setProductsForDelivery()
    }
    function setProductsForDelivery(){
        setOrderedProducts(main_data.ordered_products, user_status)
        let currency_symbol = getCurrencySymbol(created_supply['currency'])

        let total_cash = 0
        let total_tons = 0

        console.log("setProductsForDelivery data ", main_data)

        main_data.ordered_products.forEach(function(item) {
            if (item.status == 5 && typeof item.in_delivery != 'undefined' && item.in_delivery) {
                total_cash += item.cost
                total_tons += parseInt(item.counts[item.counts.length - 1])
            }
        })
        console.log("total_cash ", total_cash)
        console.log("total_tons ", total_tons)

        setSupplyFinanceStyles(total_cash, main_data.cabinet_info)

        //if (created_supply['currency'] != 'USD') {
        //    let exchange_rate = get_exchangte_rate(created_supply['currency'])
        //    total_cash = parseInt(total_cash / exchange_rate)
        //}
        let text_finance = "Cost: " + total_cash + " " + getCurrencySymbol(created_supply['currency'])
        //document.getElementById('text_supply_finance_buyer').innerHTML = text_finance
        //document.getElementById('text_supply_finance_manufacturer').innerHTML = text_finance

        let text_volume = `${formatNum(total_tons)} of ${get_kilos_to_container(total_tons)} kg`
        //document.getElementById('text_supply_weight_manufacturer').innerHTML = text_volume
        //document.getElementById('text_supply_weight_buyer').innerHTML = text_volume



        let client_name = ''
        console.log("buyer ", buyer)
        if (user_status == 'manufacturer') {
            client_name = buyer.name
        } else {
            main_data.ordered_products.forEach(function(item, i, arr) {
                if (item.status == 5 && typeof item.in_delivery != 'undefined' && item.in_delivery) {
                    client_name = item.manufacturer
                }
            })
        }
        let supply_country = main_data.incoterms.filter(function(item){ return item.incoterm_name == created_supply['incoterm']})[0].country_code



        let line_info = `<div  class="list-order-admin visible">
                              <div class="text_info">
                                  <div class="name">
                                        <img class="country_flag" data-country="${supply_country}"  data-type="supply"   src="img/flags/${supply_country}.svg"  data-tippy-content="Destination country"/>
                                        <div class="supply_info">
                                            <div>${client_name}</div>
                                            <div class="details">${created_supply['incoterm']}</div>
                                        </div>
                                  </div>
                              </div>
                         </div>`


        let products_table = ''
        main_data.ordered_products.forEach(function(item, i, arr) {
            if (item.status == 5 && typeof item.in_delivery != 'undefined' && item.in_delivery) {
                let counts_last    = parseInt(item.counts[item.counts.length - 1])
                const product_cost = parseInt(counts_last * parseFloat(item.price))

                let div_price = `${parseFloat(item.price).toFixed(2)} ${currency_symbol}`
                if (item.price == 0) {
                    div_price = `<img class="supply_need_price" src="img/achtung_yellow.svg" data-tippy-content="No price for current conditions" />`
                } else if (user_status == "manufacturer" ) {
                    div_price = `<input type="number" class="supply_product_price" data-tippy-content="You can change price" value="${parseFloat(item.price).toFixed(2)}" /> ${currency_symbol}`
                }


                products_table += `<tr class="spg_table_row formed_supply_products" data-product-id="${item.id}">
                                             <td>
                                                <div class="div_supply_product_name">
                                                    <img class="btn_remove_from_delivery" data-tippy-content="Remove from delivery" src="img/btn_delivery_remove.svg" />
                                                    ${item.name}

                                                </div>
                                             </td>
                                             <td class="text_right product_price">${div_price}</td>
                                             <td class="text_right">${formatNum(counts_last)} kg</td>
                                             <td class="supply_product_cost text_right">${formatNum(product_cost)} ${currency_symbol}</td>
                                         </tr>`

            }
        })



        const total = `<tr class="spg_table_row table_block">
                                         <td >DUE</td>
                                         <td class="text_right"></td>
                                         <td class="text_right">${text_volume}</td>
                                         <td class="supply_cost text_right">${formatNum(total_cash)} ${currency_symbol}</td>
                                     </tr>`




        let supply_html =    `<div class="list-item-supply visible">
                                  ${line_info}
                                  <div class="supply_products" style="display: block">

                                    <table  class="spg_table">
                                        <tbody>
                                            ${products_table}
                                            ${total}
                                        </tbody>
                                    </table>
                                  </div>
                              </div>`

        Array.from(document.getElementsByClassName("div_created_supply_products")).forEach(function(element) {
            element.innerHTML = supply_html
        });






        let display_drag = total_tons > 0 ? "none" : "block"
        let display_info = total_tons > 0 ? "flex" : "none"
        let display_btn  = total_tons > 0 ? "block" : "none"
        Array.from(document.getElementsByClassName("supply_drag_drop")).forEach(function(element) {
            element.style.display = display_drag
        });

        // document.getElementById('div_supply_info_manufacturer').style.display = display_info

        document.getElementById('btn_send_supply_manufacturer').style.display = display_btn
        document.getElementById('btn_send_supply_buyer').style.display = display_btn
        //document.getElementById('div_supply_info_buyer').style.display = display_info








        Array.from(document.getElementsByClassName("btn_remove_from_delivery")).forEach(function(element) {
            element.addEventListener('click', removeFromDelivery );
        })
        tippy(`.supply_need_price, .country_flag, .supply_product_price, .btn_remove_from_delivery`, {
            content: 'My tooltip!',
            followCursor: 'horizontal',
            animation: 'fade',
        });
    }


    function setSupplies(supplies, who_open, archive = false){
        if (document.getElementById("div_chat").style.display == 'block') {return}

        let supplies_formed_html = ''
        let supplies_enroute_html = ''
        let supplies_unpaid_html = ''
        let supplies_claimed_html = ''
        let supplies_paid_html = ''
        let supplies_ws_html = ''


        let total = {
            formed:   {cash: 0, tons: 0},
            en_route: {cash: 0, tons: 0},
            claimed:  {cash: 0, tons: 0},
            unpaid:   {cash: 0, tons: 0} }
        let messages = {
            formed:   {new: 0, person: 0, notify: 0},
            en_route: {new: 0, person: 0, notify: 0},
            claimed:  {new: 0, person: 0, notify: 0},
            unpaid:   {new: 0, person: 0, notify: 0},
        }

        supplies.forEach(function(supply, i, arr) {
            const item_html = get_supply_html(supply, who_open, false)


            if (supply.status == 6) {
                supplies_formed_html += item_html
                total.formed.cash += supply.supply.supply_cost
                total.formed.tons += supply.supply.supply_tons
                messages.formed.new    += supply.new_message_new
                messages.formed.person += supply.new_message_person
                messages.formed.notify += supply.new_message_notify
            }
            if (supply.status == 7) {
                supplies_enroute_html += item_html
                total.en_route.cash += supply.supply.supply_cost
                total.en_route.tons += supply.supply.supply_tons
                messages.en_route.new    += supply.new_message_new
                messages.en_route.person += supply.new_message_person
                messages.en_route.notify += supply.new_message_notify
            }

            if (supply.status == 10) {
                if (supply.supply.paid) {
                    supplies_paid_html += item_html
                } else {
                    supplies_unpaid_html += item_html
                    total.unpaid.cash += supply.supply.supply_cost
                    total.unpaid.tons += supply.supply.supply_tons
                    messages.unpaid.new    += supply.new_message_new
                    messages.unpaid.person += supply.new_message_person
                    messages.unpaid.notify += supply.new_message_notify
                }
            }


            //console.log(`supply invoice ${supply.supply.invoice_num }   claim_present ${supply.supply.claim_present}   claim_close ${supply.supply.claim_close}`)
            if (supply.supply.claim_present && !supply.supply.claim_close) {
//                console.log("supplies_claimed_html ", item_html)
                supplies_claimed_html += item_html
                total.claimed.cash += supply.supply.supply_cost
                total.claimed.tons += supply.supply.supply_tons
                messages.claimed.new    += supply.new_message_new
                messages.claimed.person += supply.new_message_person
                messages.claimed.notify += supply.new_message_notify
            }


            let ws_html = get_supply_html(supply, who_open, true)
            if (supply.in_workspace ){
                supplies_ws_html += ws_html
            }

        })



        Array.from(document.getElementsByClassName("div_paid_supplies")).forEach(function(element) {
            element.style.display = 'block'
        });

        if (archive) {
            Array.from(document.getElementsByClassName("list-paid-supplies")).forEach(function(element) {
                element.innerHTML = supplies_paid_html
            });
            return
        }



        // Обновляем суммарную информацию в блоках
        let all_supplies_divs = [
            "div_formed_supplies",
            "div_sended_supplies",
            "div_claimed_supplies",
            "div_unpaid_supplies"
        ]
        let message_types = ["new", "person", "notify"]
        all_supplies_divs.forEach(function(div, i) {
            Array.from(document.getElementsByClassName(`${div}`)).forEach(function(d) {
                d.style.display = 'block'
                let block_name = ''
                if      (i == 0) {block_name = 'formed'}
                else if (i == 1) {block_name = 'en_route'}
                else if (i == 2) {block_name = 'claimed'}
                else if (i == 3) {block_name = 'unpaid'}

                let cash = formatNum(parseInt(total[`${block_name}`].cash))
                let tons = formatNum(parseInt(total[`${block_name}`].tons))
                d.getElementsByClassName("section_musd")[0].innerText = `${cash} USD`
                d.getElementsByClassName("section_mt")[0].innerText   = `${tons} KG`


                message_types.forEach(function(message_type) {
                    let counter = 0
                    if      (i == 0) {counter = messages.formed[`${message_type}`]}
                    else if (i == 1) {counter = messages.en_route[`${message_type}`]}
                    else if (i == 2) {counter = messages.claimed[`${message_type}`]}
                    else if (i == 3) {counter = messages.unpaid[`${message_type}`]}

//                    console.log(`block_name ${block_name}   message_type ${message_type}   counter ${counter}`)
                    let container = d.getElementsByClassName(`section_new_${message_type}`)[0]

                    // TODO убрать ИФ после масштабирования
                    if (typeof container != 'undefined') {
                        container.classList.remove('update_true')
                        container.innerHTML = `<img src="img/${message_type}_${counter > 0}.svg"/>${counter}`
                        if (counter > 0){
                            container.classList.add('update_true')
                        }
                    }
                })
            })
        })


        console.log("supply messages ", messages)



        Array.from(document.getElementsByClassName("list-formed-supplies")).forEach(function(element) {
            element.innerHTML = supplies_formed_html
            visibilityToSupplyElement(element, "formed")
        });
        Array.from(document.getElementsByClassName("list-sended-supplies")).forEach(function(element) {
            element.innerHTML = supplies_enroute_html
            visibilityToSupplyElement(element, "en_route")
        });
        Array.from(document.getElementsByClassName("list-claimed-supplies")).forEach(function(element) {
            element.innerHTML = supplies_claimed_html
            visibilityToSupplyElement(element, "claimed")
        });
        Array.from(document.getElementsByClassName("list-unpaid-supplies")).forEach(function(element) {
            element.innerHTML = supplies_unpaid_html
            visibilityToSupplyElement(element, "unpaid")
        });

        Array.from(document.getElementsByClassName("div_claimed_supplies")).forEach(function(element) {
            element.style.display = supplies_claimed_html == '' ? "none" : "block"
        });

        function visibilityToSupplyElement(div, message_type){
            let show_full_list = false
            if (messages[`${message_type}`].new == 0 && messages[`${message_type}`].person == 0 && messages[`${message_type}`].notify == 0 ){
                show_full_list = true
            }
            if (show_all_orders_click[`${message_type}`]) {show_full_list = true}

            if (show_full_list) {
                Array.from(div.getElementsByClassName("list-item-supply")).forEach(function(e) {
                    e.style.display = 'block'
                })
            }
            div.innerHTML += `<div class="show_all_supplies ${show_full_list ? ''  : 'visible'}"><img src="img/show.svg" />SHOW ALL</div>`
        }


        Array.from(document.getElementsByClassName(`show_all_supplies`)).forEach(function(element) {
            element.addEventListener('click', showAllSupplies)

        })
        function showAllSupplies(){
            this.style.display = 'none'
            const supplies = this.parentElement.getElementsByClassName(`list-item-supply`)
            Array.from(supplies).forEach(function(element) {
                element.style.display = 'block'
            })

            const parentClasses = this.parentElement.parentElement.classList
            if (parentClasses.contains('div_formed_supplies'))  {show_all_orders_click.formed   = true}
            if (parentClasses.contains('div_sended_supplies'))  {show_all_orders_click.en_route = true}
            if (parentClasses.contains('div_claimed_supplies')) {show_all_orders_click.claimed  = true}
            if (parentClasses.contains('div_unpaid_supplies'))  {show_all_orders_click.unpaid   = true}

            console.log("show_all_orders_click ", show_all_orders_click)
        }

        set_supplies_actions()
    }
    function get_supply_html(supply, who_open, for_desktop = false, invoice_search = false){

        let btn_reform  = ``
        let btn_eta  = ``
        let btn_delivered  = ``
        let btn_download_files  = ``
        let btn_payment = ``
        let btn_delivery_tracking = ``
        let btn_claim  = ``
        let btn_claim_close  = ``

        let client_name = ''
        if (who_open === 'manufacturer') { client_name = ` ${supply.supply.client_name}. `}
        else {client_name = ` ${supply.supply.manufacturer}. `}

        let invoice_num = ``
        if (supply.supply.status > 6){
            invoice_num = `<span class="invoice_number" data-tippy-content="Invoice number"> Invoice #${supply.supply.invoice_num} </span>`
        }


        if (supply.status === 6 && who_open === 'manufacturer') {
            btn_reform = createOrderBtn('open_popup_disband_delivery', "Disband delivery", 'reform_delivery')
            btn_eta = createOrderBtn('open_popup_eta', "Set ETA", 'calendar_set')
        }
        if (supply.status > 6) {
            btn_payment = createOrderBtn('open_popup_payment_info', "Payment info", 'payment')
            btn_download_files = createOrderBtn('download_supply_documents', "Download documents", 'invoice_file')
            btn_delivery_tracking = createOrderBtn('open_delivery_tracking', "Delivery tracking", 'filter_region')
        }

        if ([7, 8, 9].includes(supply.status) && who_open === 'manufacturer') {
            btn_delivered = createOrderBtn('open_popup_supply_delivered', "Delivered", 'confirm')
        }

        // if (who_open == 'buyer' && supply.supply.time_to_pay) {
           // btn_extra = `<!--<div class="action-btn open_popup_supply_payment" >Set payment date</div>-->`
        // }







        let supply_products_html   = ''
        let total_cash = 0
        let total_tons = 0

        let currency_symbol = getCurrencySymbol(supply.supply.currency)
        supply.products.forEach(function(product, i, arr) {
            let counts_last    = parseInt(product.counts[product.counts.length - 1])
            const product_cost = parseInt(counts_last * parseFloat(product.price))

            let div_price = `${parseFloat(product.price).toFixed(2)} ${currency_symbol}`
            if (product.price == 0) {
                div_price = `<img class="supply_need_price" src="img/achtung_yellow.svg" data-tippy-content="No price for current conditions" />`
            } else if (user_status == "manufacturer" ) {
                if (supply.status == 6) {
                    div_price = `<input type="number" class="supply_product_price" data-tippy-content="You can change price" value="${parseFloat(product.price).toFixed(2)}" /> ${currency_symbol}`
                } else {
                    div_price = `${parseFloat(product.price).toFixed(2)} ${currency_symbol}`
                }
            }

            supply_products_html += `<div class="product_item" data-tons="${counts_last}" data-product-id="${product.id}">
                                        <div class="product_name">${product.name}</div>
                                        <div class="product_cost">${div_price}</div>
                                        <div class="product_quantity">${formatNum(counts_last)} kg</div>
                                    </div>`
                // < td  className = "supply_product_cost text_right" >${formatNum(product_cost)} ${currency_symbol} < /td>

            total_tons += counts_last
            total_cash += parseInt(product_cost)
        })

        const total = `<div class="product_item total">
                           <div class="product_name">DUE</div>
                           <div class="product_cost">${formatNum(total_cash)} ${currency_symbol}</div>
                           <div class="product_quantity">${formatNum(total_tons)} kg</div>
                       </div>
                       <div class="product_item">
                           <div class="product_name">Paid (${supply.supply.payment_percent}%)</div>
                           <div class="product_cost">${formatNum(supply.supply.payment_complete)} ${currency_symbol}</div>
                           <div class="product_quantity"></div>
                       </div>`

        const products_table = `${supply_products_html}
                                ${total}`




        if (invoice_search){
            if (supply.status > 6) {
                if (user_status == 'buyer') {
                    if (supply.supply.claim_present) {
                        btn_claim = `<img src="img/claim_chat.svg" class="open_claim_chat" data-tippy-content="Open claim chat"/>`
                    } else {
                        btn_claim = `<img src="img/claim_open.svg" class="open_popup_create_claim" data-tippy-content="Create claim"/>`
                    }
                }


                if (user_status == 'manufacturer' && supply.supply.claim_present) {
                    btn_claim = `<img src="img/claim_chat.svg" class="open_claim_chat" data-tippy-content="Open claim chat"/>`

                    if (supply.supply.claim_close == false) {
                        btn_claim_close = `<img src="img/claim_close.svg" class="open_popup_close_claim"  data-tippy-content="Close claim"/>`
                    }
                }
            }
        }

        let text_claim = ``
        if (supply.supply.claim_present){
            text_claim = supply.supply.claim_close ? "Solved" : "Claimed"

            if (user_status == 'buyer') {
                btn_claim = `<img src="img/claim_chat.svg" class="open_claim_chat" data-tippy-content="Open claim chat"/>`
            }

            if (user_status == 'manufacturer') {
                btn_claim = `<img src="img/claim_chat.svg" class="open_claim_chat" data-tippy-content="Open claim chat"/>`

                if (supply.supply.claim_close == false) {
                    btn_claim_close = `<img src="img/claim_close.svg" class="open_popup_close_claim"  data-tippy-content="Close claim"/>`
                }
            }
        }



        let chat_src = 'chat'
        if (supply.supply.user_chat_activity) {
            chat_src ='chat_person'
        }
        let supply_visible = false
        if (supply.new_message_new > 0 || supply.new_message_person > 0 || supply.new_message_notify > 0 ) {
            supply_visible = true
            chat_src += '_new'
        }

        if      (show_all_orders_click.formed   && supply.status == 6) { supply_visible = true }
        else if (show_all_orders_click.en_route && supply.status == 7) { supply_visible = true }
        else if (show_all_orders_click.unpaid   && supply.status == 10) { supply_visible = true }
        else if (supply.supply.claim_present) { supply_visible = true }

        // let btn_chat = `<img data-new="false" class="open_chat_supplies" src="img/${chat_src}.svg" data-tippy-content="Chat"/>`
        let btn_chat =  `<div data-new="false" class="order_btn open_chat_supplies"><img src="img/${chat_src}.svg"/><div>Messages</div></div>`



        let  html = `
                        <div class="order_item list-item-supply ${supply_visible ? 'visible' : ''}"
                             data-supply-id="${supply.supply.id}"
                             data-supply-lead-time="${supply.supply.lead_time}"
                             data-region="${supply.supply.region}">
                            <div class="order_info_main">
                                <div class="status_indicator status color-6"></div>
                                <div class="order_info_left">
                                    <div class="main_info">
                                        <img class="flag" src="img/flags/${supply.supply.country}.svg" />
                                        <div class="order_title">${client_name}${invoice_num}</div>
                                    </div>
                                    <div class="secondary_info">
                                        ${supply.supply.incoterm}
                                    </div>

                                </div>

                                <div class="order_info_right">
                                    <div class="main_info">
                                        <div class="order_title">${formatNum(total_cash)} ${currency_symbol}</div>
                                    </div>
                                    <div class="secondary_info">
                                        ${supply.supply.eta_date_str}
                                    </div>

                                </div>
                            </div>
                            <div class="order_info_secondary">
                                <div class="delivery_products_list">
                                    ${products_table}
                                    <div class="supply_save_prices action-btn" >Save price changes</div>
                                </div>
                            </div>

                             <div class="order_updates  ${chat_src.includes("new") ? "" : "hidden"}">
                                <div class="container_activity">
                                    <img src="img/notify/notify_true.svg">
                                    <div>New activity</div>
                                </div>

                                <div class="container_more">
                                    <img src="img/actions/dots.svg"/>
                                </div>
                            </div>

                            <div class="order_btns">
                                  ${btn_eta}
                                  ${btn_reform}

                                  ${btn_delivered}
                                  ${btn_delivery_tracking}
                                  ${btn_download_files}
                                  ${btn_claim}
                                  ${btn_claim_close}
                                  ${btn_payment}
                                  ${btn_chat}

                            </div>

                        </div>`
        return html
    }


    function set_supplies_actions(){



        Array.from(document.getElementsByClassName("order_info_main")).forEach(function(element) {
            element.addEventListener('click', showMoreOrderInfo );
        })


        Array.from(document.getElementsByClassName("open_chat_supplies")).forEach(function(element) {
            element.setAttribute("data-tippy-content", "Discussion and delivery statuses")
            element.addEventListener('click', openChatSupply );
        });
        Array.from(document.getElementsByClassName("remove_from_workspace")).forEach(function(element) {
            element.addEventListener('click', removeFromWorkspace );
        });

        if (user_status !== 'buyer') {
            Array.from(document.getElementsByClassName("open_popup_eta")).forEach(function(element) {
                element.addEventListener('click', openPopupSetETA );
            });
            Array.from(document.getElementsByClassName("open_popup_disband_delivery")).forEach(function(element) {
                element.addEventListener('click', openPopupDisbandDelivery );
            });

            Array.from(document.querySelectorAll(".open_popup_supply_statuses")).forEach(function(element) {
                element.addEventListener('click', openPopupNewStatus );
            });
            Array.from(document.querySelectorAll(".open_popup_supply_delivered")).forEach(function(element) {
                element.addEventListener('click', openPopupSupplyDelivered );
            });
        }

        Array.from(document.getElementsByClassName("supply_product_price")).forEach(function(element) {
            element.addEventListener('input', changeSupplyCost );
        });
        Array.from(document.getElementsByClassName("supply_save_prices")).forEach(function(element) {
            element.addEventListener('click', supplySavePrices );
        });


        Array.from(document.querySelectorAll(".open_popup_payment_info")).forEach(function(element) {
            element.addEventListener('click', openPopupPaymentInfo );
        });
        Array.from(document.querySelectorAll(".download_supply_documents")).forEach(function(element) {
            element.addEventListener('click', openPopupSupplyDocuments );
        });
        Array.from(document.querySelectorAll(".open_delivery_tracking")).forEach(function(element) {
            element.addEventListener('click', openPopupSupplyTracking );
        });


        Array.from(document.querySelectorAll(".open_popup_supply_payment")).forEach(function(element) {
            element.addEventListener('click', openPopupPaymentInfoBuyer );
        });

        Array.from(document.querySelectorAll(".btn_hide_founded_supply")).forEach(function(element) {
            element.addEventListener('click', hideFoundedSupply );
        });

        Array.from(document.querySelectorAll(".open_claim_chat")).forEach(function(element) {
            element.addEventListener('click', openClaimChat );
        });
        Array.from(document.querySelectorAll(".open_popup_create_claim")).forEach(function(element) {
            element.addEventListener('click', openPopupCreateClaim );
        });
        Array.from(document.querySelectorAll(".open_popup_close_claim")).forEach(function(element) {
            element.addEventListener('click', openPopupCloseClaim );
        });




        setAccesses()

        tippy(`.remove_from_workspace, .supply_sale_date, .supply_eta_date, .open_popup_disband_delivery, .supply_product_price,  .supply_need_price, .open_popup_supply_delivered,
        .open_popup_payment_info, .open_popup_eta, .open_chat_supplies, .invoice_number, .open_popup_claim, .download_supply_documents,
        .open_delivery_tracking, .open_claim_chat, .open_popup_create_claim, .open_popup_close_claim`, {
            content: 'My tooltip!',
            followCursor: 'horizontal',
            animation: 'fade',
        });
    }


    let created_supply = {manufacturer_id: '', incoterm: '', currency: '', products: [], comment: ''}


    let selected_buyer_for_supply = ''
    document.getElementById('btn_supply_select_buyer').addEventListener('click', function (evt) {

        evt.preventDefault();
        evt.stopPropagation();


        let companies = []
        Array.from(document.querySelectorAll(".list-manufactured-products .list-ordered-product")).forEach(function(element) {
            if (!companies.includes(element.getAttribute("data-company-name"))) {
                companies.push(element.getAttribute("data-company-name"))
            }

        });


        autocomplete(document.getElementById("supply_select_buyer"), companies, true);
        selected_buyer_for_supply = ''
        //document.getElementById("filter_order_company").value = ''
        showPopup("supply_select_buyer")

    });
    document.getElementById('btn_supply_set_buyer').addEventListener('click', function (evt) {
        selected_buyer_for_supply = document.getElementById('supply_select_buyer').value
        if (selected_buyer_for_supply == '') {showAlert("Select customer"); return}

        let buyer_id = null
        sendRequest("post", 'get_buyer_id_from_name', {name: selected_buyer_for_supply})
            .then(data => {
                buyer_id = data.buyer_id

                sendRequest("post", 'get_manufacturer_buyer_info', {buyer_id: buyer_id})
                    .then(data => {
                        buyer = data.cabinet_info
                        //setAvailableCountries(buyer.countries)
                        setAvailableIncoterms(buyer.incoterms)
                        setAvailableCurrencies(buyer.currencies)
                        //setAvailablePickupDates()

                        let display_div = 'block'
                        if (buyer.currencies.length == 1) {
                            display_div = 'none'
                            created_supply['currency'] = buyer.currencies[0]
                        }
                        document.getElementById('div_supply_currencies').style.display = display_div


                        closePopup()
                        showPopup("product_supply_create")
                    })
            })
    });

    document.getElementById('btn_create_supply_buyer').addEventListener('click', function(evt){
        created_supply = {manufacturer_id: '', incoterm: '', currency: '', products: [], comment: ''}

        evt.preventDefault();
        evt.stopPropagation();

        // let display_div = 'block'
        // if (buyer.currencies.length == 1) {
        //     display_div = 'none'
        //     created_supply['currency'] = main_data.cabinet_info.currencies[0]
        // }
        // document.getElementById('div_supply_currencies').style.display = display_div

        createManufacturersForSupply()
        document.getElementById('supply_create_step_1').style.display = 'block'
        document.getElementById('supply_create_step_2').style.display = 'none'
        document.getElementById('supply_create_step_3').style.display = 'none'
        showPopup("product_supply_create")
    })
    function createManufacturersForSupply(){
        let html = ""
        main_data.buyer_manufacturers.forEach(item => {
            html += `<div class="supply_manufacturers_list order_conditions" data-manufacturer-id="${item.id}">${item.name}</div>`
        })
        document.getElementById('supply_create_manufacturers').innerHTML = html
        Array.from(document.getElementsByClassName("supply_manufacturers_list")).forEach(function(element) {
            element.addEventListener('click', setSupplyManufacturer )
        })

        function setSupplyManufacturer(){
            created_supply["manufacturer_id"] = parseInt(this.getAttribute('data-manufacturer-id'))
            document.getElementById('supply_create_step_1').style.display = 'none'
            document.getElementById('supply_create_step_2').style.display = 'block'
            setSupplyIncoterms(created_supply["manufacturer_id"])
            setSupplyCurrencies(created_supply["manufacturer_id"])
        }

        function setSupplyIncoterms(manufacturer_id){
            let manufacturer = main_data.buyer_manufacturers.filter(m => {return m.id == manufacturer_id})[0]

            console.log("manufacturer ", manufacturer)
            let html = ''
            manufacturer.incoterms.forEach((item, i) => {
                html += `<div class="order_conditions  btns-supply-incoterm" data-type="incoterm"  data-value="${item}"><div>${item}</div></div>`
            })

            document.getElementById('supply_incoterms').innerHTML = html
            Array.from(document.querySelectorAll(".btns-supply-incoterm")).forEach(function(element) {
                element.addEventListener('click', setSupplyIncoterm)
            })
        }

        function setSupplyCurrencies(manufacturer_id){
            let manufacturer = main_data.buyer_manufacturers.filter(m => {return m.id == manufacturer_id})[0]

            let html = ''
            manufacturer.currencies.forEach((item, i) => {
                html += `<div class="order_conditions  btns-supply-currency"  data-value="${item}"><div>${item}</div></div>`
            })

            document.getElementById('supply_currencies').innerHTML = html
            Array.from(document.querySelectorAll(".btns-supply-currency")).forEach(function(element) {
                element.addEventListener('click', setSupplyCurrency );
            })
        }
    }
    function setSupplyIncoterm(){
        created_supply["incoterm"] = this.getAttribute('data-value')
        document.getElementById('supply_create_step_2').style.display = 'none'
        document.getElementById('supply_create_step_3').style.display = 'block'

    }
    Array.from(document.querySelectorAll(".btns-supply-incoterm")).forEach(function(element) {
        element.addEventListener('click', changeSupplyIncoterm );
    });
    function changeSupplyIncoterm(){
        Array.from(document.querySelectorAll(`.btns-supply-incoterm`)).forEach(function(element) {
            element.classList.remove("active")
        });
        this.classList.add("active")

        const incoterm = this.getAttribute("data-value")
        created_supply['incoterm'] = incoterm
    }

    function setSupplyCurrency(){
        created_supply["currency"] = this.getAttribute('data-value')
        console.log("manufacturer_id ", created_supply["manufacturer_id"])



        document.getElementById('btn_create_supply').click()
    }
    function changeSupplyCurrency(){
        Array.from(document.querySelectorAll(`.btns-supply-currency`)).forEach(function(element) {
            element.classList.remove("active")
        });
        this.classList.add("active")

        const currency = this.getAttribute("data-value")
        created_supply['currency'] = currency
    }
    document.getElementById('btn_send_supply_buyer').addEventListener('click', function(){
        let products = []
        Array.from(document.querySelectorAll(".formed_supply_products")).forEach(function(element) {
            let cell_price = element.getElementsByClassName('product_price')[0]

            let price = 0
            if (cell_price.childElementCount == 0) {
                price = cell_price.innerText
            } else if (cell_price.firstChild.classList.contains('supply_need_price')) {
                price = 0
            } else if (cell_price.firstChild.classList.contains('supply_product_price')) {
                price = cell_price.firstChild.value
            }


            products.push({
                id:    element.getAttribute("data-product-id"),
                price: price
            })
        });

        if (products.length == 0) {
            showAlert("Select products")
            return
        }

        // created_supply.comment = document.getElementById('supply_comment_value').value
        fetch(
            `${api_url}create_supply`,
            { method: 'post',
                body: JSON.stringify({
                    conditions: created_supply,
                    products: products
                }),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                showNotify("Delivery created")

                // document.getElementById('btn_create_supply_buyer').style.display = 'block'
                Array.from(document.getElementsByClassName("btn_add_to_delivery")).forEach(function(element) {
                    element.style.display = "none"
                })
                delivery_formed_active = false
                console.log(`json ${json}`)
                document.getElementById('div_supply_create_buyer').style.display = 'none'
                setOrderedProducts(json.ordered_products, "buyer")
                setSupplies(json.supplies, "buyer")


                let btn_section = document.getElementById(`btn_section_formed`)
                if (btn_section.src.includes("show")) {
                    btn_section.click()
                }
                updateNewMessages()
                updateDebtors(json.buyer_id)
                updateWorkSpaceAll()


            })
            .catch( error => console.error('error:', error) );
    })

    let delivery_formed_active = false
    document.getElementById('btn_create_supply').addEventListener('click', function(){
        console.log("created_supply ", created_supply)

        let show_alert = false
        if (created_supply['incoterm'] === '' ) {show_alert = true}
        if (created_supply['currency'] === '' ) {show_alert = true}
        if (show_alert) {
            showAlert("Select all values");
        } else {
            showNotify("To add product to delivery, click icon")
            console.log("created_supply ", created_supply)
            //showAlert(`Drag products from "Ready to collect" to "Delivery"`)
            Array.from(document.getElementsByClassName("btn_add_to_delivery")).forEach(function(element) {
                element.style.display = "block"
            })

            delivery_formed_active = true

            main_data.ordered_products.forEach(function(item) {
                if (item.status == 5 && item.in_delivery) {
                    item.in_delivery = false
                }
            })

            readyProductUpdatePrice()

        }
    })
    function readyProductUpdatePrice(){
        let updated_products = main_data.ordered_products.filter(function(item) {
            if (item.status == 5 ) {
                return item
            }
        })

        sendRequest('post', 'ready_product_update_price', {conditions: created_supply})
            .then(data => {
                main_data.ordered_products = data.ordered_products
                setOrderedProducts(data.ordered_products, user_status)

                if (selected_buyer_for_supply == '') {
                    createSupplyBuyer()
                } else {
                    createSupplyManufacturer()
                }
                setProductsForDelivery()


                Array.from(document.querySelectorAll('.list-manufactured-products .list-ordered-product')).forEach(element =>{
                    element.style.display = 'none'

                    console.log("sort for supply ", parseInt(element.getAttribute("data-manufacturer-id")))
                    if (created_supply["manufacturer_id"] == parseInt(element.getAttribute("data-manufacturer-id"))) {
                        element.style.display = 'flex'
                    }
                })
                //updateNewMessages()
            })
            .catch(err => console.log(err))
    }
    function setSupplyFinanceStyles(current, credit_info){
        console.log("credit_info, ", credit_info)

        const el = document.getElementById('text_supply_credit_buyer')
        el.innerHTML = ''
        if (credit_info.credit_limit > 0) {

            let credit_available = credit_info.credit_available
            let current_value = current

            if (created_supply['currency'] != 'USD') {
                //let exchange_rate = get_exchangte_rate(created_supply['currency'])
                //credit_available = parseInt(credit_available / exchange_rate)
                //current_value = parseInt(current_value / exchange_rate)
            }

            let credit = credit_available - current_value
            el.innerHTML = `Credit: ${formatNum(credit)}  ${getCurrencySymbol(created_supply['currency'])}`


            let color = credit < 0 ? '#EB5757' : '#FFFFFF'
            el.style.color = color
        }





        const el2 = document.getElementById('text_supply_credit_manufacturer')
        el2.innerHTML = ''
        if (buyer.credit_limit > 0) {
            let credit_available = buyer.credit_available
            let current_value = current

            if (created_supply['currency'] != 'USD') {
                //let exchange_rate = get_exchangte_rate(created_supply['currency'])
                //credit_available = parseInt(credit_available / exchange_rate)
                //current_value = parseInt(current_value / exchange_rate)
            }

            let credit = credit_available - current_value
            el2.innerHTML = `Credit: ${formatNum(credit)}  ${getCurrencySymbol(created_supply['currency'])}`


            let color = credit < 0 ? '#EB5757' : '#FFFFFF'
            el2.style.color = color
        }


    }
    function get_kilos_to_container(present_kilos){
        let containers = Math.floor(present_kilos / 12000)

        let available_kilos = (containers + 1 ) * 12000
        if (present_kilos % 12000 == 0) {available_kilos = containers * 12000}


        console.log("containers ", containers)
        console.log("available_kilos ", available_kilos)

        return formatNum(available_kilos)
    }



    let selected_buyer_for_order = ''
    document.getElementById('btn_order_select_buyer').addEventListener('click', function (evt) {

        autocomplete(document.getElementById("order_select_buyer"), main_data.buyers.map(a => a.name), true);
        selected_buyer_for_order = ''
        showPopup("order_select_buyer")
        console.log("btn_order_select_buyer")

        evt.stopPropagation()
    });
    document.getElementById('btn_order_set_buyer').addEventListener('click', function (evt) {
        selected_buyer_for_order = document.getElementById('order_select_buyer').value
        if (selected_buyer_for_order == '') {showAlert("Select customer"); return}

        let buyer_id = null
        sendRequest("post", 'get_buyer_id_from_name', {name: selected_buyer_for_order})
            .then(data => {
                buyer_id = data.buyer_id

                sendRequest("post", 'get_manufacturer_buyer_info', {buyer_id: buyer_id})
                    .then(data => {
                        buyer = data.cabinet_info
                        setAvailableCountries(buyer.countries)
                        setAvailableIncoterms(buyer.incoterms)
                        setAvailableCurrencies(buyer.currencies)
                        setAvailablePickupDates()

                        setProductsList(data.products, data.cabinet_info)

                        changeCurrentPage('manufacturer_order_products')
                        closePopup()
                    })
            })
    });



    function createSupplyBuyer(){
        document.getElementById(`popup_background`).style.display = 'none'
        //document.getElementById('supply_header_buyer').innerHTML = `Incoterms: ${created_supply['incoterm']}`
        document.getElementById('div_supply_create_buyer') .style.display = 'block';
        //document.getElementById('div_supply_info_buyer')   .style.display = `none`
        document.getElementById('btn_send_supply_buyer')   .style.display = `none`
        //document.getElementById('btn_create_supply_buyer') .style.display = `none`
        supply_total_tons = 0
        supply_total_cash = 0
        const btn_show_section = document.getElementById('btn_section_ready_buyer')
        if (btn_show_section.src.includes('show.svg')) {btn_show_section.click()}


    }

    function createSupplyManufacturer(){
        console.log("buyer ", buyer)
        document.getElementById(`popup_background`).style.display = 'none'
        document.getElementById('div_supply_create_manufacturer') .style.display = 'block'
        document.getElementById('btn_send_supply_manufacturer')   .style.display = `none`
        supply_total_tons = 0
        supply_total_cash = 0

        const btn_show_section = document.getElementById('btn_section_ready')
        if (btn_show_section.src.includes('show.svg')) {btn_show_section.click()}
    }
    document.getElementById('btn_send_supply_manufacturer').addEventListener('click', function(){
        let products = []
        Array.from(document.querySelectorAll(".formed_supply_products")).forEach(function(element) {
            let cell_price = element.getElementsByClassName('product_price')[0]

            let price = 0
            if (cell_price.childElementCount == 0) {
                price = cell_price.innerText
            } else if (cell_price.firstChild.classList.contains('supply_need_price')) {
                price = 0
            } else if (cell_price.firstChild.classList.contains('supply_product_price')) {
                price = cell_price.firstChild.value
            }


            products.push({
                id:    element.getAttribute("data-product-id"),
                price: price
            })
        });
        console.log(`products ${products}`)

        // created_supply.comment = document.getElementById('supply_comment_value').value
        fetch(
            `${api_url}create_supply`,
            { method: 'post',
                body: JSON.stringify({
                    conditions: created_supply,
                    products:   products
                }),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                showNotify("Delivery created")

                console.log(`json ${json}`)
                document.getElementById('div_supply_create_manufacturer').style.display = 'none'
                setOrderedProducts(json.ordered_products, "manufacturer")
                setSupplies(json.supplies, "manufacturer")
                updateNewMessages()
                updateWorkSpaceAll()
                delivery_formed_active = false
                Array.from(document.getElementsByClassName("btn_add_to_delivery")).forEach(function(element) {
                    element.style.display = "none"
                })
            })
            .catch( error => console.error('error:', error) );
    })



    function openPopupDisbandDelivery(e){
        e.preventDefault()
        e.stopPropagation()

        let parent = this.parentElement.parentElement
        showPopup("supply_disband")
        document.getElementById('supply_disband').setAttribute("data-supply-id", parent.getAttribute("data-supply-id"))
    }
    document.getElementById('supply_disband').addEventListener('click', function(){

        sendRequest("post", 'supply_disband', {supply_id: this.getAttribute("data-supply-id")})
            .then(data => {
                closePopup()
                setOrderedProducts(data.ordered_products, "manufacturer")
                setSupplies(data.supplies, "manufacturer")
                updateNewMessages()
            })

    })


    function changeSupplyCost(){
        const parent = this.parentElement.parentElement
        const supply_element = this.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement
        supply_element.getElementsByClassName('supply_save_prices')[0].style.display = 'block'

        const tons = parseInt( parent.getAttribute("data-tons"))

        const product_total_element = parent.getElementsByClassName('supply_product_cost')[0]
        const supply_total_element  = parent.parentElement.getElementsByClassName('supply_cost')[0]

        const old_product_cost = parseInt(product_total_element.innerText.replace(/ /g,'').replace('$',''))
        const new_product_cost = parseInt(tons * this.value)

        const old_supply_cost  = parseInt(supply_total_element.innerText.replace(/ /g,'').replace('$',''))


        const new_supply_cost = old_supply_cost + (new_product_cost - old_product_cost)
        product_total_element.innerText = `$${formatNum(new_product_cost)}`
        supply_total_element.innerText  = `$${formatNum(new_supply_cost)}`
    }
    function supplySavePrices(){
        console.log("Save new prices")

        const btn = this
        const parent = this.parentElement
        const supply_id = parent.getAttribute("data-supply-id")

        let new_products_prices = []
        Array.from(parent.querySelectorAll(".spg_table_row")).forEach(function(element) {
            //Если не финальная строка
            if (!element.classList.contains("table_block")) {
                new_products_prices.push({
                    product_id: element.getAttribute("data-product-id"),
                    new_price: element.getElementsByClassName('supply_product_price')[0].value
                })
            }
        });


        console.log("supply_id ", supply_id)
        console.log("new_products_prices ", new_products_prices)

        sendRequest('post', 'set_supply_new_prices', {supply_id: supply_id, new_products_prices: new_products_prices})
            .then(data => {
                showNotify("Changes saved")
                //showAlert("Saved")
                btn.style.display = 'none'
            })
            .catch(err => console.log(err))
    }



    function openPopupSetETA(e){
        e.preventDefault()
        e.stopPropagation()

        document.getElementById('supply_set_document').value = ''
        document.getElementById('supply_set_invoice_num').value = ''
        document.getElementById('supply_set_sale_date').value = ''
        document.getElementById('supply_set_eta_date').value = ''
        // document.getElementById('supply_set_eta_date').innerHTML = ''

        let parent = this.parentElement.parentElement
        showPopup("supply_set_eta")
        let supply_id = parent.getAttribute("data-supply-id")
        document.getElementById('supply_set_eta').setAttribute("data-supply-id", supply_id)

        let lead_time = parseInt(parent.getAttribute("data-supply-lead-time"))
        document.getElementById('btn_eta_days').innerHTML = `+${lead_time} days`
        document.getElementById('btn_eta_days').setAttribute("data-days", lead_time)

        getSupplyDocuments(supply_id)

    }
    document.getElementById('btn_eta_days').addEventListener('click', function(){
        let days = parseInt(this.getAttribute("data-days"))
        let sale_date = document.getElementById('supply_set_sale_date').value

        var base_date = new Date();
        if (sale_date != ""){

            base_date.setDate(sale_date.split(".")[0] )
            base_date.setMonth(sale_date.split(".")[1] - 1)
            base_date.setFullYear(sale_date.split(".")[2] )
        }

        var target_date = new Date();
        target_date.setDate(base_date.getDate() + days);


        document.getElementById('supply_set_eta_date').value = getFormattedDate(target_date)
    })
    document.getElementById('btn_supply_set_paid_date').addEventListener('click', function(){
        closePopup()

        const payment_date = document.getElementById('supply_payment_date').value

        if (payment_date == ''   ) {
            showAlert("Please fill all fields")
            return
        }

        const supply_id = this.getAttribute("data-supply-id")
        fetch(
            `${api_url}supply_set_payment_date`,
            { method: 'post',
                body: JSON.stringify({
                    supply_id: supply_id,
                    payment_date: payment_date
                    //eta_date: document.getElementById('supply_set_eta_date').value
                }),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {

                setSupplies(json.supplies, "buyer")
                updateNewMessages()
                closePopup()
            })
            .catch( error => console.error('error:', error) );
    })
    document.getElementById('supply_set_eta').addEventListener('click', function(){
        closePopup()

        const invoice_num = document.getElementById('supply_set_invoice_num').value
        const sale_date = document.getElementById('supply_set_sale_date').value
        const eta_date = document.getElementById('supply_set_eta_date').value

        if (sale_date == '' || eta_date == '' || invoice_num == '') {
            showAlert("Please fill all fields")
            return
        }

        const supply_id = this.getAttribute("data-supply-id")
        const list = document.getElementById('page_manufacturer_orders').getElementsByClassName('list-formed-supplies')[0]
        const element = list.querySelectorAll(`[data-supply-id="${supply_id}"]`)[0]

        element.classList.add("animate__animated")
        element.classList.add("animate__backOutDown")


        fetch(
            `${api_url}supply_set_eta`,
            { method: 'post',
                body: JSON.stringify({
                    supply_id: supply_id,
                    invoice_num: invoice_num,
                    sale_date: sale_date,
                    eta_date: eta_date,
                    workspace_filter: workspace_filter
                    //eta_date: document.getElementById('supply_set_eta_date').value
                }),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                showNotify("Changes saved")

                setSupplies(json.supplies, "manufacturer")
                updateNewMessages()
                closePopup()

                workspace_data.supplies = json.ws_supplies
                document.querySelectorAll(`.graph_type_supplies[data-value=${workspace_filter.value_type}]`)[0].click()

                updateDebtors(json.buyer_id)
                updateWorkSpaceAll()



            })
            .catch( error => console.error('error:', error) );
    })


    function addDocumentToSupply(){
        let supply_id = this.getAttribute("data-supply-id")
        document.getElementById('supply_set_document').setAttribute("data-supply-id", supply_id)
        document.getElementById('supply_set_document').click()
    }
    document.getElementById('supply_set_document').onchange = function(){

        const formData = new FormData();
        const file_name = this.files[0].name
        const file_value = document.getElementById('supply_set_document');
        console.log("supply_set_document change ", file_name)
        formData.append('supply_id', this.getAttribute("data-supply-id"));
        formData.append('file_name', file_name);
        formData.append('token',     cookie_token)
        formData.append('file', file_value.files[0]);

        if (file_value.files.length == 0) {
            showAlert("Select file")
            return;
        }

        fetch(api_url + 'save_supply_document', {
            method: 'PUT',
            body: formData
        })
            .then((response) => response.json())
            .then((data) => {
                setSupplyDocuments(data.supply_documents)
            })
            .catch((error) => {
                console.error('Error:', error);
            });

    }
    function setSupplyDocuments(documents){
        let action_delete = ''
        if (user_status == 'manufacturer') {
            Array.from(document.getElementsByClassName("btn_add_supply_document")).forEach(function(element) {
                element.style.display = 'block'
            });

            action_delete = `<div class="supply_document_actions">
                                 <img class="supply_document_delete"   src="img/delete.svg"/>
                             </div>`
        }


        let html = ''
        documents.forEach(doc => {
            html += `
                <div class="supply_document" data-file-id="${doc.id}" data-file-name="${doc.file_name}">
                    <div class="supply_document_name">
                        <img class="supply_document_download" src="img/download.svg"/>
                        ${doc.file_name}
                    </div>

                    ${action_delete}
                </div>`
        })

        Array.from(document.getElementsByClassName("div_supply_documents")).forEach(function(element) {
            element.innerHTML = html
        });

        Array.from(document.getElementsByClassName("supply_document_download")).forEach(function(element) {
            element.addEventListener('click', downloadSupplyDocument  )
        });
        function downloadSupplyDocument(){
            if (main_data.demo){
                window.open("https://yourpartners.net/certificates/demo/contract.pdf", '_blank').focus()
                return
            }

            let doc_id = this.parentElement.parentElement.getAttribute("data-file-id")
            let file_name = this.parentElement.parentElement.getAttribute("data-file-name")

            const formData  = new FormData()
            formData.append("doc_id",doc_id)  // file id

            const headers = {
                'Authorization': 'Token token=' + cookie_token,
                //'Content-type': 'application/json'
            }

            fetch(`${api_url}download_supply_document`, {  //URL
                method: "post",
                headers: headers,
                body: formData
            }).then(response => response.blob() )
                .then(blob => {
                    var url = window.URL.createObjectURL(blob);
                    var a = document.createElement('a');
                    a.href = url;
                    a.download = file_name; // FILE NAME
                    document.body.appendChild(a);
                    a.click();
                    a.remove();  //afterwards we remove the element again
                });
        }

        Array.from(document.getElementsByClassName("supply_document_delete")).forEach(function(element) {
            element.addEventListener('click', deleteSupplyDocument  )
        });
        function deleteSupplyDocument(){
            let doc_id = this.parentElement.parentElement.getAttribute("data-file-id")
            sendRequest('post', 'delete_supply_document', {doc_id: doc_id})
                .then(data => {
                    setSupplyDocuments(data.supply_documents)
                })
                .catch(err => console.log(err))
        }
    }
    function getSupplyDocuments(supply_id){
        Array.from(document.getElementsByClassName("div_supply_documents")).forEach(function(element) {
            element.innerHTML = ''
        });


        fetch(
            `${api_url}get_supply_documents`,
            { method: 'post',
                body: JSON.stringify({
                    supply_id:  supply_id
                }),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                setSupplyDocuments(json.supply_documents)

                Array.from(document.getElementsByClassName("btn_add_supply_document")).forEach(function(element) {
                    element.setAttribute("data-supply-id", supply_id)
                    element.addEventListener('click',  addDocumentToSupply )
                })
            })
            .catch( error => console.error('error:', error) );
    }
    function openPopupSupplyDocuments(e){
        e.preventDefault()
        e.stopPropagation()
        let parent = this.parentElement.parentElement
        let supply_id = parent.getAttribute("data-supply-id")
        getSupplyDocuments(supply_id)
        showPopup("supply_documents")
    }

    let supply_payment = ''
    let payment_currency = ''
    function openPopupPaymentInfo(e){
        e.preventDefault()
        e.stopPropagation()

        let parent = this.parentElement.parentElement

        document.getElementById('div_supply_add').style.display = `none`
        document.getElementById('div_ex_rate').style.display = `none`
        document.getElementById('btn_supply_add_payment').style.display = `none`

        document.getElementById('payment_date').value = ``
        document.getElementById('payment_value').value = ``
        document.getElementById('div_ex_rate').value = ``
        document.getElementById('supply_payment_total').innerText    = ``
        document.getElementById('supply_payment_payments').innerText = ``
        document.getElementById('supply_payment_balance').innerText = ``

        fetch(
            `${api_url}get_supply_payment_info`,
            { method: 'post',
                body: JSON.stringify({
                    supply_id:  parent.getAttribute("data-supply-id")
                }),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                console.log(`json ${json}`)

                supply_payment = json
                payment_currency = json.currency

                document.getElementById('payment_currency').innerText = json.currency
                document.getElementById('supply_payment_total').innerText = `${formatNum(json.total_cost)} ${json.currency}`
                document.getElementById('supply_payment_payments').innerText = `${formatNum(json.total_payments)} ${json.currency}`
                document.getElementById('supply_payment_balance').innerText = `${formatNum(json.balance)} ${json.currency}`
                document.getElementById('payment_copy_balance').setAttribute("data-balance", json.balance)

                showPopup("supply_payment_info")

                if (json.user_status === 'manufacturer'){
                    if ( parseInt(json.total_cost) > parseInt(json.total_payments)) {
                        document.getElementById('btn_supply_add_payment').style.display = `block`
                    }
                }

            })
            .catch( error => console.error('error:', error) );
    }
    function openPopupPaymentInfoBuyer(e){
        e.preventDefault()
        e.stopPropagation()
        let parent = this.parentElement.parentElement

        fetch(
            `${api_url}get_supply_payment_info_buyer`,
            { method: 'post',
                body: JSON.stringify({
                    supply_id:  parent.getAttribute("data-supply-id")
                }),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                console.log(`json ${json}`)
                showPopup("supply_payment_set_date")
                document.getElementById('supply_payment_date').value = ''
                document.getElementById('btn_supply_set_paid_date').setAttribute("data-supply-id",  parent.getAttribute("data-supply-id"))

                document.getElementById('supply_payment_buyer_total').innerText = `${formatNum(json.total_cost)} ${json.currency}`
                document.getElementById('supply_payment_buyer_payments').innerText = `${formatNum(json.total_payments)} ${json.currency}`
                document.getElementById('supply_payment_buyer_balance').innerText = `${formatNum(json.balance)} ${json.currency}`

            })
            .catch( error => console.error('error:', error) );
    }
    document.getElementById('btn_supply_add_payment').addEventListener('click', function(){
        document.getElementById('btn_supply_add_payment').style.display = `none`
        document.getElementById('div_supply_add').style.display = `block`
    })
    document.getElementById('payment_copy_balance').addEventListener('click', function(){
        document.getElementById('payment_value').value = -1 * parseInt(this.getAttribute("data-balance"))
        showNotify("Copied")
    })
    document.getElementById('payment_ex_rate').addEventListener('input', function(){
        calculateEURtoUSD()
    })
    document.getElementById('payment_value').addEventListener('input', function(){
        if (payment_currency === 'EUR'){
            calculateEURtoUSD()
        }
    })
    function calculateEURtoUSD(){
        const value = document.getElementById('payment_ex_rate').value * document.getElementById('payment_value').value
        document.getElementById('ex_rate_result_usd').innerText = `${formatNum(parseInt(value))} USD`
    }
    document.getElementById('btn_supply_new_payment').addEventListener('click', function(){
        let error = false
        if (document.getElementById('payment_value').value === '') {error = true}
        if (document.getElementById('payment_date').value === '') {error = true}

        if (error){
            showAlert("Fill in all fields")
            return
        }

        let supply_id = supply_payment.supply.id
        fetch(
            `${api_url}add_supply_payment`,
            { method: 'post',
                body: JSON.stringify({
                    supply_id: supply_id,
                    currency:  payment_currency,
                    value:     document.getElementById('payment_value').value,
                    workspace_filter: workspace_filter,
                    payment_date: document.getElementById('payment_date').value,
                }),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                console.log(`json ${json}`)
                if (json.error == ''){
                    showNotify("Changes saved")
                    closePopup()
                    setSupplies(json.supplies, "manufacturer")

                } else {
                    showAlert(json.error)
                }

                workspace_data.supplies = json.ws_supplies
                document.querySelectorAll(`.graph_type_supplies[data-value=${workspace_filter.value_type}]`)[0].click()

                updateNewMessages()
                updateDebtors(json.buyer_id)
                updateWorkSpaceAll()
            })
            .catch( error => console.error('error:', error) );
    })


    function openPopupSupplyTracking(e){
        e.preventDefault()
        e.stopPropagation()
        let parent = this.parentElement.parentElement
        let supply_id = parent.getAttribute("data-supply-id")

        showPopup("supply_tracking")
    }



    function openPopupSupplyDelivered(e){
        e.preventDefault()
        e.stopPropagation()

        let parent = this.parentElement.parentElement
        showPopup("supply_delivered")
        document.getElementById('btn_supply_delivered').setAttribute("data-supply-id", parent.getAttribute("data-supply-id"))
    }
    document.getElementById('btn_supply_delivered').addEventListener('click', function(){

        const supply_id = this.getAttribute("data-supply-id")
        const list = document.getElementById('page_manufacturer_orders').getElementsByClassName('list-sended-supplies')[0]
        const element = list.querySelectorAll(`[data-supply-id="${supply_id}"]`)[0]

        element.classList.add("animate__animated")
        element.classList.add("animate__backOutDown")

        sendRequest('POST', 'supply_delivered', {supply_id: this.getAttribute("data-supply-id"), workspace_filter: workspace_filter})
            .then(data => {
                showNotify("Changes saved")
                setSupplies(data.supplies, "manufacturer")
                updateNewMessages()
                workspace_data.supplies = data.ws_supplies
                document.querySelectorAll(`.graph_type_supplies[data-value=${workspace_filter.value_type}]`)[0].click()
                updateDebtors(data.buyer_id)
                closePopup()

            })
            .catch(err => console.log(err))

    })

    let supply_new_status = ''
    function openPopupNewStatus(e){
        e.preventDefault()
        e.stopPropagation()

        Array.from(document.querySelectorAll(".supply-new-status")).forEach(function(element) {
            element.classList.remove('active')
        });

        let parent = this.parentElement
        supply_new_status = ''
        showPopup("supply_new_status")
        document.getElementById('btn_supply_new_status').setAttribute("data-supply-id", parent.getAttribute("data-supply-id"))
    }
    Array.from(document.querySelectorAll(".supply-new-status")).forEach(function(element) {
        element.addEventListener('click', editSupplyStatus)
    });
    function editSupplyStatus(){
        supply_new_status = this.getAttribute("data-value")
        Array.from(document.querySelectorAll(".supply-new-status")).forEach(function(element) {
            element.classList.remove('active')
        });
        this.classList.add('active')
    }
    document.getElementById('btn_supply_new_status').addEventListener('click', function(){
        if (supply_new_status === '') {
            showAlert("Select status")
            return;
        }

        const supply_id = this.getAttribute("data-supply-id")
        const list = document.getElementById('page_manufacturer_orders').getElementsByClassName('list-sended-supplies')[0]
        const element = list.querySelectorAll(`[data-supply-id="${supply_id}"]`)[0]

        element.classList.add("animate__animated")
        element.classList.add("animate__backOutDown")


        fetch(
            `${api_url}supply_new_status`,
            { method: 'post',
                body: JSON.stringify({
                    supply_id: this.getAttribute("data-supply-id"),
                    new_status: supply_new_status,
                    workspace_filter: workspace_filter,
                }),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                showNotify("Changes saved")

                setSupplies(json.supplies, "manufacturer")
                updateNewMessages()
                closePopup()

                workspace_data.supplies = json.ws_supplies
                document.querySelectorAll(`.graph_type_supplies[data-value=${workspace_filter.value_type}]`)[0].click()
            })
            .catch( error => console.error('error:', error) );
    })


    document.getElementById('btn_download_sales').addEventListener('click', function(){

        showNotify("Data is loading...")

        const headers = {
            'Authorization': 'Token token=' + cookie_token,
            //'Content-type': 'application/json'
        }

        fetch(`${api_url}get_xlsx_sales`, {
            method: "post",
            headers: headers
        }).then(response => response.blob())
            .then(blob => {

                let file_name = "Sales_" + main_data.user.name[0].toUpperCase() + main_data.user.surname + "_" + getDateToday() + ".xlsx"

                var url = window.URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = file_name;
                document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
                a.click();
                a.remove();  //afterwards we remove the element again
            });


    })

    document.getElementById('supply_archive_1month').addEventListener('click', function (evt) {
        var today = new Date();
        var target_date = new Date();

        target_date.setDate(today.getDate() - 30);

        document.getElementById('supply_archive_start').value  = getFormattedDate(target_date)
        document.getElementById('supply_archive_finish').value = getFormattedDate(today)
    })
    document.getElementById('supply_archive_3month').addEventListener('click', function (evt) {
        var today = new Date();
        var target_date = new Date();

        target_date.setDate(today.getDate() - 90);

        document.getElementById('supply_archive_start').value  = getFormattedDate(target_date)
        document.getElementById('supply_archive_finish').value = getFormattedDate(today)
    })
    document.getElementById('btn_get_supply_archive').addEventListener('click', function (evt) {
        const start  = document.getElementById('supply_archive_start').value
        const finish = document.getElementById('supply_archive_finish').value



        sendRequest("POST", "get_all_supplies", {start: start, finish: finish})
            .then(data => {
                closePopup()
                setSupplies(data.supplies,  user.organization_type, true)
                set_supplies_actions()
                Array.from(document.getElementsByClassName("list-paid-supplies")).forEach(function(element) {
                    element.style.display = 'block'

                    Array.from(element.getElementsByClassName("list-item-supply")).forEach(function(e) {
                        e.style.display = 'block'
                    })
                })

            })
            .catch(err => console.log(err))
    });



    ///// - MANAGE DELIVERY ////









    ///// + MANAGE CLAIMS ////

    function findByInvoice(invoice_num){
        console.log("invoice_num ", invoice_num)
        sendRequest('post', 'find_by_invoice', {invoice_num: invoice_num})
            .then(data => {
                showFoundedByInvoice(data.supply)
            })
            .catch(err => console.log(err))
    }
    function showFoundedByInvoice(supply){
        console.log("supply ", supply)
        let item_html = get_supply_html(supply, user_status, false, true)

        Array.from(document.getElementsByClassName("div_founded_supply")).forEach(function(element) {
            element.style.display = 'block'
        });
        Array.from(document.getElementsByClassName("list-founded-supplies")).forEach(function(element) {
            element.style.display = 'block'
            element.innerHTML = item_html

            Array.from(document.getElementsByClassName("list-item-supply")).forEach(function(e) {
                e.style.display = 'block'
            });

        });

        set_supplies_actions()
    }

    function hideFoundedSupply(){
        document.getElementById('filter_order_invoice_b').value = ''
        document.getElementById('filter_order_invoice_m').value = ''
        Array.from(document.getElementsByClassName("div_founded_supply")).forEach(function(element) {
            element.style.display = 'none'
        });
    }


    function openPopupCreateClaim(e){
        e.preventDefault()
        e.stopPropagation()

        showPopup("supply_create_claim")
        document.getElementById('btn_create_claim').setAttribute("data-supply-id", this.parentElement.parentElement.getAttribute("data-supply-id"))

    }
    document.getElementById('btn_create_claim').addEventListener('click', function (evt) {
        let supply_id = this.getAttribute("data-supply-id")
        sendRequest("post", 'supply_claim_create', {supply_id: supply_id})
            .then(data => {
                closePopup()
                openChat("supply", data.chat_header, [])
                document.getElementById('product_message_send').setAttribute("data-claimed", true)
                document.getElementById('product_message_send').setAttribute("data-type", "supply")
                document.getElementById('product_message_send').setAttribute("data-supply-id", supply_id)

                hideFoundedSupply()
                setSupplies(data.supplies, "buyer")
                updateNewMessages()

            })
    })

    function openPopupCloseClaim(e){
        e.preventDefault()
        e.stopPropagation()

        showPopup("supply_close_claim")
        document.getElementById('btn_close_claim').setAttribute("data-supply-id", this.parentElement.parentElement.getAttribute("data-supply-id"))
    }
    document.getElementById('btn_close_claim').addEventListener('click', function (evt) {
        sendRequest("post", 'supply_claim_close', {supply_id: this.getAttribute("data-supply-id")})
            .then(data => {
                closePopup()
                showNotify("Closed")
                setSupplies(data.supplies, "buyer")
                updateNewMessages()
            })
    })

    /////  - MANAGE CLAIMS ////














    ///// + MANAGE PROJECTS ////
    Array.from(document.querySelectorAll(".project_filters")).forEach(function(element) {
        element.addEventListener('click', filterProjects );
    });
    function filterProjects(){
        Array.from(document.querySelectorAll(".project_filters")).forEach(function(element) {
            element.classList.remove('active')
        });
        this.classList.add("active")

        Array.from(document.querySelectorAll(".div_projects_pages")).forEach(function(element) {
            element.style.display = 'none'
        });
        Array.from(document.querySelectorAll(`.div_projects_${this.getAttribute("data-key")}`)).forEach(function(element) {
            element.style.display = 'block'
        });
    }


    function setProjects(projects){
        setProjectsFutureTasks(projects)
        let container_with_projects = "none"
        let container_empty_project = "flex"


        //if (projects.length != 0) {
        if (true) {
            container_with_projects = "block"
            container_empty_project = "none"
        }

        Array.from(document.getElementsByClassName("container_empty_project")).forEach(function(element) {
            element.style.display = container_empty_project
        });
        Array.from(document.getElementsByClassName("container_with_projects")).forEach(function(element) {
            element.style.display = container_with_projects
        });

        let projects_html = ""
        let projects_ws_html = ""


        projects.forEach(function(item, i, arr) {
            let biggest_status = 0
            item.tasks.forEach(function(item, i, arr) {
                if (item.status <= 5) {
                    if (!item.action_finish ) {
                        if (item.action_late   > biggest_status) { biggest_status = item.action_late }
                    }
                    if (!item.reaction_finish) {
                        if (item.reaction_late > biggest_status) { biggest_status = item.reaction_late }
                    }
                }
            })

            let workspace = false
            if (item.project.in_workspace ) {
                workspace = true
            } else if (biggest_status > 0) {
                workspace = true
            }

            projects_html += getProjectHTML(item, false)
            if (workspace) {
                projects_ws_html += getProjectHTML(item, true)
            }

        });



        Array.from(document.getElementsByClassName("projects-list")).forEach(function(element) {
            element.innerHTML = projects_html

            if (projects_html == '') {
                element.innerHTML = '<br><br><h2>No active projects</h2>'
            }
        });


        Array.from(document.getElementsByClassName("list-project-user")).forEach(function(element) {
            element.addEventListener('click', openProject );
        });

        Array.from(document.querySelectorAll(".open_chat_projects")).forEach(function(element) {
            element.addEventListener('click',  openChatProject );
        });

        Array.from(document.getElementsByClassName("remove_from_workspace")).forEach(function(element) {
            element.addEventListener('click', removeFromWorkspace );
        });

        setAccesses()
        tippy('.get_project_detail, .icon_project_hide, .project_customer_name, .project_late_week, .project_late_much,' +
            '.project_customer, .remove_from_workspace, .project_distributor, .product_rival, .product_our,' +
            '.project_companies_info .flag', {
            followCursor: 'horizontal',
            animation: 'fade',
        });
    }
    function getProjectHTML(item, for_desktop){

        let biggest_status = 0
        item.tasks.forEach(function(item, i, arr) {
            if (item.status <= 5) {
                if (!item.action_finish ) {
                    if (item.action_late   > biggest_status) { biggest_status = item.action_late }
                }
                if (!item.reaction_finish) {
                    if (item.reaction_late > biggest_status) { biggest_status = item.reaction_late }
                }
            }
        })

        let late_icon = '<div class="div_project_late_status">'
        if (biggest_status == 1) { late_icon += '<img class="project_late_week" src="img/achtung_yellow.svg" data-tippy-content="Project has deadline for tasks" />' }
        if (biggest_status == 2) { late_icon += '<img class="project_late_much" src="img/achtung.svg"        data-tippy-content="Project has overdue tasks" />' }
        late_icon += '</div>'

        let info_img = '<div class="div_project_detail">'
        if ([6,7,8].includes(item.project.status)){
            const text = `Project result: ${item.project.feedback}`
            info_img += `<img class="info_img get_project_detail" src="img/info.svg"  data-tippy-content="${text}"/>`
        }
        info_img += '</div>'

        let chat_src = item.project.has_new_message ? 'chat_new' : 'chat'
        if (item.project.user_chat_activity) {
            chat_src = item.project.has_new_message ? 'chat_person_new' : 'chat_person'
        }




        let customer_name = item.project.customer_name
        let customer_tippy = "Customer"
        if (item.project.customer_name.length > 20) {
            customer_tippy = "Customer: " + item.project.customer_name
            customer_name = customer_name.substring(0,18) + "..."
        }

        let distributor_name = item.project.company_name
        let distributor_tippy = "Distributor"
        if (item.project.company_name.length > 20) {
            distributor_tippy = "Distributor: " + item.project.company_name
            distributor_name = distributor_name.substring(0,20) + "..."
        }
        let distributor_html = user_status == "buyer" ? "" : `<div class="project_distributor" data-tippy-content="${distributor_tippy}">${distributor_name}</div>`

        let companies_info = `
                    <div class="project_companies_info">
                        <img class="icon_project_hide" data-id="${item.project.id}" data-type="project" src="img/hide.svg" />
                        <img class="flag" src="img/flags/${item.project.customer_country}.svg" data-tippy-content="Customer country">

                        <div class="project_persons">
                            <div class="project_customer" data-tippy-content="${customer_tippy}">${customer_name}</div>
                            ${distributor_html}

                        </div>
                    </div>`


        let product_rival_name = item.project.product_rival
        let product_rival_tippy = "Competitors product"
        if (item.project.product_rival.length > 68) {
            product_rival_tippy = "Competitors products: " + item.project.product_rival
            product_rival_name = product_rival_name.substring(0,66) + "..."
        }


        let product_rival = product_rival_name == '' ? '' : `<div class="product_rival" data-tippy-content="${product_rival_tippy}">${product_rival_name}</div>`

        let products_info = `
                    <div class="project_products_info">
                        ${product_rival}
                        <div class="product_our"   data-tippy-content="Our product">${item.project.product_our}</div>
                    </div>`



        let html_value = `
                    <div data-region="${item.project.region}" data-company-name="${item.project.company_name}" class="list-project-user   ${item.project.has_new_message ? 'new_message' : ''}" data-project-id="${item.project.id}">

                        <div class="project_info">
                            ${companies_info}
                            ${products_info}
                        </div>

                        <div class="project_updates">
                            <div class="div_project_chat">
                                <img class="open_chat_projects" class src="img/${chat_src}.svg?v2"/>
                                <div>Messages</div>
                            </div>

                            <div class="div_project_statuses">
                                ${info_img}
                                ${late_icon}
                                <div style="flex: 5;" class="statuses">
                                    <div class="status color-project-${item.project.status}">${getProjectStatusName(item.project.status)}</div>
                                </div>
                            </div>
                        </div>







                    </div>`

        return html_value
    }
    function updateProjects(){
        fetch(
            `${api_url}get_all_projects`,
            { method: 'get',
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                console.log(`json ${json}`)
                actual_projects = json.projects
                setProjects(json.projects)
            })
            .catch( error => console.error('error:', error) );
    }


    let project_tasks_week = 0
    function setProjectsFutureTasks(projects){

        sendRequest('post', 'get_project_tasks_week_info', {week: project_tasks_week})
            .then(data => {
                console.log("get_project_tasks_week_info ", data)
                Array.from(document.querySelectorAll('.projects_tasks_week_name')).forEach(element => {
                    element.innerHTML = data.week_name
                })

                let tasks_in_week = 0
                let html = ""
                data.week_days.forEach(day => {
                    let day_html = ""
                    let tasks_in_day = 0
                    day_html += `<div class="project_date_header"><b>${day.week_day}</b> ${day.day_date}</div>`

                    projects.forEach(project => {
                        project.tasks.forEach(task => {
                            let push_task = false
                            if (task.action_finish == false && task.action_date == day.day_date_full) {
                                push_task = true
                            }
                            if (task.reaction_finish == false && task.reaction_date == day.day_date_full) {
                                push_task = true
                            }

                            if (push_task) {
                                tasks_in_day += 1
                                tasks_in_week += 1
                                let task_text = ''
                                if (task.action_finish == false){
                                    task_text = task.action_text
                                }else if (task.reaction_finish == false){
                                    task_text = task.reaction_text
                                }

                                day_html += `
                                    <div data-project-id="${project.project.id}" class="project_info color-project-${task.status}">
                                        <div class="project_name">
                                            <div>${project.project.customer_name}</div>
                                            <div>${project.project.product_our}</div>
                                        </div>
                                        <div class="project_description">
                                            ${task_text}
                                        </div>
                                    </div>`
                            }
                        })
                    })

                    if (tasks_in_day > 0) {
                        html += day_html
                    }
                })

                if (tasks_in_week == 0) {
                    html =  `<div class="project_no_tasks">No tasks this week</div>`
                }

                Array.from(document.querySelectorAll('.div_future_tasks')).forEach(element => {
                    element.innerHTML = html
                })

                Array.from(document.querySelectorAll('.div_future_tasks  .project_info')).forEach(element => {
                    element.addEventListener('click', clickProjectWeekTask)
                })

                return





                let header_html = ''
                data.week_days.forEach(day => {
                    header_html += `<div class="day_tasks">
                                        <div class="week_day">${day.week_day}</div>
                                        <div>${day.day_date}</div>
                                    </div>`
                })

                Array.from(document.querySelectorAll('.div_future_tasks  .week_calendar.header')).forEach(element => {
                    element.innerHTML = header_html
                })


                let week_tasks = [[], [], [], [], []]
                data.week_days.forEach((day, i) => {
                    projects.forEach(project => {
                        project.tasks.forEach(task => {
                            let push_task = false
                            if (task.action_finish == false && task.action_date == day.day_date_full) {
                                push_task = true
                            }
                            if (task.reaction_finish == false && task.reaction_date == day.day_date_full) {
                                push_task = true
                            }

                            if (push_task) {
                                let task_text = ''
                                if (task.action_finish == false){
                                    task_text = task.action_text
                                }else if (task.reaction_finish == false){
                                    task_text = task.reaction_text
                                }

                                week_tasks[i].push({
                                    project_id:   project.project.id,
                                    project_name: project.project.customer_name,
                                    product_our:  project.project.product_our,
                                    status:       task.status,
                                    task_text:    task_text,
                                })
                            }
                        })
                    })
                })

                console.log("week_tasks ", week_tasks)

                let days_html = []
                week_tasks.forEach(day_tasks => {
                    let html = '<div class="day_tasks empty"></div>'
                    if (day_tasks.length > 0) {
                        html = '<div class="day_tasks">'
                        day_tasks.forEach(task => {
                            html += `
                                    <div data-project-id="${task.project_id}" data-tippy-content="${task.task_text}" class="project_info color-project-${task.status}">
                                        <div class="project_name">
                                            ${task.project_name}
                                        </div>
                                        <div class="project_description">
                                            ${task.product_our}
                                        </div>
                                    </div>`
                        })
                        html += '</div>'
                    }
                    days_html.push(html)
                })

                let week_html = ''
                days_html.forEach(day_html => {
                    week_html += day_html
                })

                Array.from(document.querySelectorAll('.div_future_tasks  .week_calendar.tasks')).forEach(element => {
                    element.innerHTML = week_html
                })

                Array.from(document.querySelectorAll('.div_future_tasks  .week_calendar.tasks .project_info')).forEach(element => {
                    element.addEventListener('click', clickProjectWeekTask)
                })

                tippy(`.project_info `)
            })

    }
    Array.from(document.querySelectorAll(".btn_change_project_tasks_week")).forEach(function(element) {
        element.addEventListener('click', changeWeekTasks );
    });
    function changeWeekTasks(){
        if (this.getAttribute("data-move") == 'prev') {
            project_tasks_week -= 1
        } else {
            project_tasks_week += 1
        }

        //Array.from(document.querySelectorAll('.btn_change_project_tasks_week[data-move="prev"]')).forEach(function(element) {
        //    element.style.display = project_tasks_week == 0 ? 'none' : 'block'
        //})

        setProjectsFutureTasks(actual_projects)
    }
    function clickProjectWeekTask(){
        const founded_project = actual_projects.find(item => item.project.id ===  parseInt(this.getAttribute("data-project-id")))
        showProject(founded_project)
    }


    let current_project = null
    function openProject(){
        if (user_status == 'buyer') {
            changeCurrentPage("projects")
        } else {
            changeCurrentPage("manufacturer_projects")
        }

        const project_id = this.getAttribute("data-project-id")

        console.log("project_id ", project_id)
        console.log("project_id ", project_id)
        const founded_project = actual_projects.find(item => item.project.id ===  parseInt(project_id))
        console.log("founded_project ", founded_project)
        showProject(founded_project)

        //setChatProject(project_id, false)

    }
    function showProject(project){
        console.log("showProject ", project)
        console.log("user_status ", user_status)

        current_project = project
        project_type = ``
        project_manufacturer = ``

        const label_buyer  = document.getElementById('project_chat_buyer')
        const label_manufacturer = document.getElementById('project_chat_manufacturer')
        let chat_src = project.project.has_new_message ? 'chat_new' : 'chat'
        if (project.project.user_chat_activity) {
            chat_src = project.project.has_new_message ? 'chat_person_new' : 'chat_person'
        }
        label_buyer.src = 'img/' + chat_src + '.svg'
        label_manufacturer.src = 'img/' + chat_src + '.svg'


        document.getElementById('project_chat_buyer').setAttribute("data-project-id", project.project.id)
        document.getElementById('project_chat_manufacturer').setAttribute("data-project-id", project.project.id)

        document.getElementById('div_project_main')       .style.display = 'block'
        document.getElementById('div_project_create').style.display = 'none'
        document.getElementById('div_project_info')  .style.display = 'block'
        document.getElementById('project_feed')      .style.display = 'block'
        // document.getElementById('btn_change_project_status').setAttribute("data-project-id", project.project.id)
        document.getElementById('btn_project_task_create').setAttribute("data-project-id", project.project.id)
        document.getElementById('btn_project_edit').setAttribute("data-project-id", project.project.id)

        Array.from(document.getElementsByClassName("project_desc")).forEach(function(element) {
            element.style.display = 'none'
        });
        Array.from(document.querySelectorAll(".wrapper_project_detail")).forEach(function(element) {
            element.style.display = 'none'
        });




        if (["distributor_exclusive", "distributor", "buyer"].includes(user_status)) {
            changeCurrentPage("project")
        } else {
            changeCurrentPage("manufacturer_project")
        }


        setProjectStatus(project.project.status)
        setProjectInfo(project.project)
        setProjectTasks(project.tasks)
    }


    function setProjectStatus(status_num){

        let status_name = ''

        Array.from(document.getElementsByClassName("project_status")).forEach(function(element) {
            element.classList.remove('active')
            element.classList.remove('passed')

            const element_step = parseInt(element.getAttribute("data-step"))
            if (element_step < parseInt(status_num)) {
                element.classList.add('passed')
            } else if (element_step == parseInt(status_num)) {
                element.classList.add('active')
                status_name = element.getElementsByClassName("content")[0].innerText
            }
        });


        Array.from(document.getElementsByClassName("project_status_arrow")).forEach(function(element) {
            let src = "img/project_status_arrow.svg"
            const element_step = parseInt(element.getAttribute("data-step"))
            if (element_step < parseInt(status_num)) {
                src = "img/project_status_arrow_passed.svg"
            } else if (element_step == parseInt(status_num)) {
                src = "img/project_status_arrow_active.svg"
            }

            element.setAttribute("src", src)
        });




        Array.from(document.querySelectorAll(`.project_task_client, .project_task`)).forEach(function(element) {
            element.classList.remove('active')

            if (element.classList.contains(`project_tasks_${status_num}`)) {
                element.classList.add('active')
            }
        });


        document.getElementById('text_project_job_add').innerText = `PLAN TASK FOR ${status_name} STAGE`

    }
    function setProjectInfo(project){
        document.getElementById('project_owner_flag').src = `img/flags/${project.company_country}.svg`
        document.getElementById('project_owner').innerHTML = project.company_name

        //if (project.customer_name.toLowerCase().indexOf('project') >= 0 ) {
        document.getElementById('project_company').innerHTML = project.customer_name
        document.getElementById('project_company_flag').src = `img/flags/${project.customer_country}.svg`

        //} else document.getElementById('project_company').innerHTML = `${project.customer_name} project`
        document.getElementById('project_desc').innerHTML = project.desc

        document.getElementById('project_base_product').innerHTML = project.product_rival
        document.getElementById('div_project_base_product').style.display = project.project_type == "replace" ?  'block' : 'none'
        document.getElementById('project_type_img')    .style.display = project.project_type == "replace" ?  'block' : 'none'

        document.getElementById('project_new_product') .innerHTML = project.product_our
        document.getElementById('project_bulk').innerHTML = formatNum(project.bulk)

        //if (project.customer_name.toLowerCase().indexOf('project') >= 0 ) {
        document.getElementById('project_company_2').innerHTML = "CLIENT: " + project.customer_name
        document.getElementById('project_company_2_flag').src = `img/flags/${project.customer_country}.svg`


        //} else document.getElementById('project_company_2').innerHTML = `${project.customer_name} project`
        document.getElementById('project_desc_2').innerHTML = project.desc

        document.getElementById('project_base_product_2').innerHTML = project.product_rival
        document.getElementById('div_project_base_product_2').style.display = project.project_type == "replace" ?  'flex' : 'none'
        document.getElementById('project_type_img_2')    .style.display = project.project_type == "replace" ?  'block' : 'none'

        document.getElementById('project_new_product_2') .innerHTML = project.product_our
        document.getElementById('project_bulk_2').innerHTML = formatNum(project.bulk)

    }
    function setProjectTasks(tasks){

        let project_tasks_html_1 = ''
        let project_tasks_html_2 = ''
        let project_tasks_html_3 = ''
        let project_tasks_html_4 = ''
        let project_tasks_html_5 = ''

        tasks.forEach(function(item, i, arr) {
//            console.log(item )



            let result = getProjectTaskHTML(item, current_project)
            switch (item.status){
                case 1:
                    project_tasks_html_1 += result
                    break;
                case 2:
                    project_tasks_html_2 += result
                    break;
                case 3:
                    project_tasks_html_3 += result
                    break;
                case 4:
                    project_tasks_html_4 += result
                    break;
                case 5:
                    project_tasks_html_5 += result
                    break;
            }
        });


        let project_tasks_1 = document.getElementsByClassName('project_tasks_1')[0]
        let project_tasks_2 = document.getElementsByClassName('project_tasks_2')[0]
        let project_tasks_3 = document.getElementsByClassName('project_tasks_3')[0]
        let project_tasks_4 = document.getElementsByClassName('project_tasks_4')[0]
        let project_tasks_5 = document.getElementsByClassName('project_tasks_5')[0]

        project_tasks_1.style.display = 'block'
        project_tasks_2.style.display = 'block'
        project_tasks_3.style.display = 'block'
        project_tasks_4.style.display = 'block'
        project_tasks_5.style.display = 'block'

        project_tasks_1.innerHTML = ''
        project_tasks_2.innerHTML = ''
        project_tasks_3.innerHTML = ''
        project_tasks_4.innerHTML = ''
        project_tasks_5.innerHTML = ''

        if (project_tasks_html_1 !== '') {
            project_tasks_1.innerHTML = `<div class="text-header">Creation</div>`
            project_tasks_1.innerHTML += project_tasks_html_1
        } else {project_tasks_1.style.display = 'none'}

        if (project_tasks_html_2 !== '') {
            project_tasks_2.innerHTML = `<div class="text-header">Presentation</div>`
            project_tasks_2.innerHTML += project_tasks_html_2
        } else {project_tasks_2.style.display = 'none'}

        if (project_tasks_html_3 !== '') {
            project_tasks_3.innerHTML = `<div class="text-header">Offer</div>`
            project_tasks_3.innerHTML += project_tasks_html_3
        } else {project_tasks_3.style.display = 'none'}

        if (project_tasks_html_4 !== '') {
            project_tasks_4.innerHTML = `<div class="text-header">Testing</div>`
            project_tasks_4.innerHTML += project_tasks_html_4
        } else {project_tasks_4.style.display = 'none'}

        if (project_tasks_html_5 !== '') {
            project_tasks_5.innerHTML = `<div class="text-header">Decision</div>`
            project_tasks_5.innerHTML += project_tasks_html_5
        } else {project_tasks_5.style.display = 'none'}



        function setFiltersProject(task_items, filter_items) {
            let project_tasks_html = [
                project_tasks_html_1,
                project_tasks_html_2,
                project_tasks_html_3,
                project_tasks_html_4,
                project_tasks_html_5,
            ]
            let project_stage_filters = Array.from(filter_items);
            let project_tasks = Array.from(task_items);

            project_stage_filters.forEach(function(element, i) {

                if (i == 0) {
                    element.addEventListener('click', function(event) {
                        project_stage_filters.forEach(function(element) {
                            element.classList.remove("active");
                        });
                        this.classList.add("active");

                        project_tasks.forEach((element) => {
                            element.style.display = 'block'
                        });
                    });

                } else if (project_tasks_html[i - 1] !== '') {
                    project_stage_filters[i].classList.remove("not_process")

                    element.addEventListener('click', function(event) {
                        project_stage_filters.forEach(function(element) {
                            element.classList.remove("active");
                        });
                        this.classList.add("active");

                        switch (this.getAttribute('data-project-task')) {
                            case "1":
                                project_tasks.forEach((element) => {
                                    element.style.display = 'none'
                                });
                                project_tasks[4].style.display = 'block';

                                break;
                            case "2":
                                project_tasks.forEach((element) => {
                                    element.style.display = 'none'
                                });
                                project_tasks[3].style.display = 'block';

                                break;
                            case "3":
                                project_tasks.forEach((element) => {
                                    element.style.display = 'none'
                                });
                                project_tasks[2].style.display = 'block';

                                break;
                            case "4":
                                project_tasks.forEach((element) => {
                                    element.style.display = 'none'
                                });
                                project_tasks[1].style.display = 'block';

                                break;
                            case "5":
                                project_tasks.forEach((element) => {
                                    element.style.display = 'none'
                                });
                                project_tasks[0].style.display = 'block';

                                break;
                        }

                    });
                } else {
                    project_stage_filters[i].classList.add("not_process")
                }
            });
            project_tasks.forEach((element) => {
                element.style.display = 'block'
            });
        }
        setFiltersProject (document.getElementsByClassName("project_task"), document.getElementsByClassName("project_stage_filter"));
        setFiltersProject (document.getElementsByClassName("project_task_client"), document.getElementsByClassName("project_stage_filter_client"));

        function tasksForManufacturer(){
            let project_tasks_1m = document.getElementsByClassName('project_tasks_1')[1]
            let project_tasks_2m = document.getElementsByClassName('project_tasks_2')[1]
            let project_tasks_3m = document.getElementsByClassName('project_tasks_3')[1]
            let project_tasks_4m = document.getElementsByClassName('project_tasks_4')[1]
            let project_tasks_5m = document.getElementsByClassName('project_tasks_5')[1]

            project_tasks_1m.style.display = 'block'
            project_tasks_2m.style.display = 'block'
            project_tasks_3m.style.display = 'block'
            project_tasks_4m.style.display = 'block'
            project_tasks_5m.style.display = 'block'

            project_tasks_1m.innerHTML = ''
            project_tasks_2m.innerHTML = ''
            project_tasks_3m.innerHTML = ''
            project_tasks_4m.innerHTML = ''
            project_tasks_5m.innerHTML = ''

            if (project_tasks_html_1 !== '') {
                project_tasks_1m.innerHTML = `<div class="text-header">Creation</div>`
                project_tasks_1m.innerHTML += project_tasks_html_1
            } else {project_tasks_1m.style.display = 'none'}

            if (project_tasks_html_2 !== '') {
                project_tasks_2m.innerHTML = `<div class="text-header">Presentation</div>`
                project_tasks_2m.innerHTML += project_tasks_html_2
            } else {project_tasks_2m.style.display = 'none'}

            if (project_tasks_html_3 !== '') {
                project_tasks_3m.innerHTML = `<div class="text-header">Offer</div>`
                project_tasks_3m.innerHTML += project_tasks_html_3
            } else {project_tasks_3m.style.display = 'none'}

            if (project_tasks_html_4 !== '') {
                project_tasks_4m.innerHTML = `<div class="text-header">Testing</div>`
                project_tasks_4m.innerHTML += project_tasks_html_4
            } else {project_tasks_4m.style.display = 'none'}

            if (project_tasks_html_5 !== '') {
                project_tasks_5m.innerHTML = `<div class="text-header">Contract</div>`
                project_tasks_5m.innerHTML += project_tasks_html_5
            } else {project_tasks_5m.style.display = 'none'}

        }
        tasksForManufacturer()



        tippy('.tippy_popup, .project_reaction_arrow', {
            content: 'My tooltip!',
            followCursor: 'horizontal',
            animation: 'fade',
        });




        Array.from(document.getElementsByClassName("project_action")).forEach(function(element) {
            element.addEventListener('click', checkTaskAction)

        });

        Array.from(document.getElementsByClassName("project_reaction")).forEach(function(element) {
            element.addEventListener('click', checkTaskReaction)
        });
        //Array.from(document.getElementsByClassName("complete")).forEach(function(element) {
        //    element.addEventListener('click', showTaskComplete)
        //});
    }
    function getProjectTaskHTML(item, selected_project) {
        let action_html   = ''
        let reaction_html = ''

        let action_late   = ''
        let reaction_late = ''
        if (!item.action_finish ) {
            if (item.action_late === 1 || item.action_late === 0) { action_late = 'this_week' }
            if (item.action_late === 2) { action_late = 'late' }
        } else {action_late = 'task_complete'}
        if (!item.reaction_finish) {
            if (item.reaction_late === 1 || item.reaction_late === 0) { reaction_late = 'this_week' }
            if (item.reaction_late === 2) { reaction_late = 'late' }
        } else {reaction_late = 'task_complete'}

        let btn_color_class = ''



        const task_in_active = selected_project == '' ||  selected_project.project.status == item.status
        let action_img   = item.action_finish ? "img/action.svg" : "img/action_active.svg"

        let reaction_img = item.reaction_finish ? "img/reaction.svg" : "img/reaction_active.svg"

        let dd_active = false
        if (user_status == "buyer" && main_data.accesses.projects_manage){
            dd_active = true
        }

        let action_dropdown = `<div class="drop drop--down ${dd_active ? '' : 'is-disabled'}">
                                       <div class="more ${action_late}">${item.action_finish ? "Done" : "In process"}</div>

                                       <div class="drop__content -transition-slide-in">
                                           <div class="drop-arrow"></div>

                                           <div class="drop-list -size-medium -position-right -border-rounded">
                                               <button data-result="no"  class="dd_task_action drop-list__btn">In process</button>
                                               <button data-result="yes" class="dd_task_action drop-list__btn">Done</button>
                                           </div>
                                       </div>
                                   </div>`


        action_html = `<div class="project_action">
                                 <img class="tippy_popup" src="${action_img}" data-tippy-content="Action"/>
                                <!--<div class="action_id">${item.id.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}</div>-->
                                <div class="project_action_wrap ${item.action_finish ? "" : "active"}">
                                   ${item.action_text}

                                   <div class="project_actions_date ${action_late}" style="display:${item.action_finish ? "none" : "flex"}">
                                       <!--<input class="cb_task_action" type="checkbox" ${item.action_finish ? "checked" : ""} />-->
                                       <!--<img src="img/check.svg">-->
                                       TO: ${item.action_date}
                                       ${action_late === 'late' ? '<img src="img/achtung.svg" class="project_achtung_img">' : '<div class="project_action_status"></div>'}
                                   </div>
                               </div>
                           </div>`

        if (item.action_finish && item.reaction_date != null) {
            let reaction_text = item.reaction_text
            if (reaction_text == null || reaction_text == ''){
                reaction_text = "Receive and process feedback"
            }

            let reaction_dropdown = `<div class="drop drop--down ${dd_active ? '' : 'is-disabled'}">
                                       <div class="more  ${reaction_late}">${item.reaction_finish ? "Done" : "In process"}</div>

                                       <div class="drop__content -transition-slide-in">
                                           <div class="drop-arrow"></div>

                                           <div class="drop-list -size-medium -position-right -border-rounded">
                                               <button data-result="no"  class="dd_task_reaction drop-list__btn">In process</button>
                                               <button data-result="yes" class="dd_task_reaction drop-list__btn">Done</button>
                                           </div>
                                       </div>
                                   </div>`
            reaction_html = `<div class="project_reaction">
                                    <img class="tippy_popup" src="${reaction_img}" data-tippy-content="Reaction"/>
                                     <div class="project_reaction_wrap  ${item.reaction_finish ? "" : "active"}">
                                     <!--<div class="project_date">${item.task_date}</div>-->
                                         <div class="task_text" >${reaction_text}</div>

                                         <div class="project_actions_date ${reaction_late}" style="display:${item.reaction_finish ? "none" : "flex"}">
                                             <!--<input class="cb_task_reaction" type="checkbox" ${item.reaction_finish ? "checked" : ""} />-->
                                             <!--<img src="img/check.svg">-->
                                             TO: ${item.reaction_date}
                                             ${reaction_late === 'late' ? '<img src="img/achtung.svg"  class="project_achtung_img">' : '<div class="project_action_status"></div>'}
                                         </div>
                                     </div>
                                 </div>`
        }



        let result = `<div class="project_job history" data-task-id="${item.id}">
                                ${action_html}
                                ${reaction_html}

                            </div>`

        return result
    }
    function setChatProject(project_id, show){

        sendRequest('post', 'get_project_messages', {project_id: project_id})
            .then(data => {

                if (show){
                    openChat("project", `Project for ${data.project.customer_name}`, data.messages)

                    document.getElementById('product_message_send').setAttribute("data-type", "project")
                    document.getElementById('product_message_send').setAttribute("data-project-id", project_id)

                    updateNewMessages()
                }

            })
            .catch(err => console.log(err))
    }

    Array.from(document.getElementsByClassName("more_project_info")).forEach(function(element) {
        element.addEventListener('click', showProjectInfo  )
    });
    function showProjectInfo(){
        let display = 'none'
        if (document.getElementsByClassName("project_desc")[0].style.display == 'none') {
            display = 'block'
        }

        Array.from(document.getElementsByClassName("project_desc")).forEach(function(element) {
            element.style.display = display
        });
        Array.from(document.querySelectorAll(".wrapper_project_detail")).forEach(function(element) {
            element.style.display = display
        });
    }
    Array.from(document.getElementsByClassName("project_status")).forEach(function(element) {
        element.addEventListener('click', switchProjectStatus  );
    });
    function switchProjectStatus(){

        console.log("user_status ", user_status)
        console.log("current_project.project.status ", current_project.project.status)

        if (current_project.project.status > 5) {
            return;
        }

        // position changes
        if (main_data.accesses.projects_manage == true){
            if (["buyer"].includes(user_status)) {

                const step = parseInt(this.getAttribute("data-step"))
                console.log("step ", step)

                if (step == 5) {
                    if (![1,6,7].includes(current_project.project.status)){
                        checkProjectFinishedTasks()

                    }
                } else {
                    setProjectStatus(step)
                    changeProjectStatus(step)
                }
            }
        }

    }
    function changeProjectStatus(new_status){
        fetch(
            `${api_url}project_change_status`,
            { method: 'post',
                body: JSON.stringify({
                    status: new_status,
                    project_id: current_project.project.id
                }),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                showNotify("Project status changed")
                updateProjects()
                showProject(json)
            })
            .catch( error => console.error('error:', error) );
    }

    function getProjectStatusName(status){
        let name = ''
        switch (status){
            case 1:
                name = 'creation'
                break;
            case 2:
                name = 'presentation'
                break;
            case 3:
                name = 'offer'
                break;
            case 4:
                name = 'testing'
                break;
            case 5:
                name = 'contract'
                break;
            case 6:
                name = 'closed'
                break;
            case 7:
                name = 'success'
                break;
            case 8:
                name = 'other'
                break;
        }

        return name
    }
    function checkProjectFinishedTasks(){

        let project_have_open_task = false
        current_project.tasks.forEach(function(item){
            if (!item.action_finish){
                project_have_open_task = true
            }

            if (item.reaction_date != null && !item.reaction_finish) {
                project_have_open_task = true
            }
        })

        if (project_have_open_task) {
            showNotify("Close all tasks before completing project")
        } else {
            showPopup("project_finish")
            document.getElementById('project_finish_feedback').value = ''
        }

    }



    document.getElementById('div_project_job_add').onclick = function(){
        showPopup("project_task")
    }


    document.getElementById('btn_project_task_create').onclick = function(){
        const action_text = document.getElementById('feedback_value').value
        const action_date = document.getElementById('feedback_next_date').value

        console.log("action_date ", action_date)
        console.log("action_date ", typeof action_date)
        if (action_text == '' || action_date == '') {
            showAlert("Fill in all fields")
            return
        }

        const project_id = this.getAttribute("data-project-id")
        fetch(
            `${api_url}project_task_create`,
            { method: 'post',
                body: JSON.stringify({
                    project_id:  project_id,
                    action_text: action_text,
                    action_date: action_date
                }),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {


                showNotify("Task created")
                console.log(`json ${json}`)
                showProject(json)
                document.getElementById(`popup_background`).style.display = 'none'
                const index = actual_projects.findIndex(item => item.project.id ===  parseInt(project_id))
                console.log(`actual_projects ${actual_projects}`)
                console.log(`index ${index}`)
                actual_projects[index] = json
                console.log(`actual_projects ${actual_projects}`)

                updateProjects()
            })
            .catch( error => console.error('error:', error) );
    }
    document.getElementById('btn_task_action_finish').addEventListener('click', function(){
        if (reaction_wait === 'yes') {
            if (document.getElementById('reaction_date').value === '') {
                showAlert("Fill in all fields")
                return
            }
        }

        sendTaskAction(this.getAttribute("data-task-id"), true)
    })
    function sendTaskAction(task_id, result){
        fetch(
            `${api_url}task_action_finish`,
            { method: 'post',
                body: JSON.stringify({
                    task_id:       task_id,
                    reaction_date: document.getElementById('reaction_date').value,
                    action_result: result
                }),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                showProject(json)
                closePopup()
            })
            .catch( error => console.error('error:', error) );
    }
    function checkTaskAction(e){
        let parent = this.parentElement
        showPopup("task_action_finish")
        document.getElementById('project_reaction_date').style.display = 'none'
        document.getElementById('btn_task_action_finish').setAttribute("data-task-id", parent.getAttribute("data-task-id"))
        document.getElementById('reaction_date').value = ''
        return


        console.log(this)
        e.preventDefault();
        e.stopPropagation();
        // let parent = this.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement
        console.log(parent.getAttribute("data-task-id"))

        if (this.getAttribute("data-result") === 'yes') {
            showPopup("task_action_finish")
            document.getElementById('project_reaction_date').style.display = 'none'
            document.getElementById('btn_task_action_finish').setAttribute("data-task-id", parent.getAttribute("data-task-id"))
            document.getElementById('reaction_date').value = ''
        } else {
            sendTaskAction(parent.getAttribute("data-task-id"), false)
        }
    }
    let reaction_wait = ''
    Array.from(document.querySelectorAll(".btns-project-reaction-wait")).forEach(function(element) {
        element.addEventListener('click', changeProjectReactionWait );
    });
    function changeProjectReactionWait(){
        console.log("changeProjectReactionWait")
        Array.from(document.querySelectorAll(`[data-type=${this.getAttribute("data-type")}]`)).forEach(function(element) {
            element.classList.remove("active")
        });
        this.classList.add("active")
        reaction_wait = this.getAttribute("data-value")

        if (reaction_wait === "yes"){
            document.getElementById('project_reaction_main').style.display = 'none'
            document.getElementById('btn_task_action_finish').style.display = 'block'
            document.getElementById('project_reaction_date').style.display = 'block'
        } else {
            document.getElementById('project_reaction_date').style.display = 'none'
            document.getElementById('btn_task_action_finish').click()
            sendTaskAction(document.getElementById('btn_task_action_finish').getAttribute("data-task-id"), true)
        }
    }


    function checkTaskReaction(){
        let parent = this.parentElement
        showPopup("task_reaction_finish")
        document.getElementById('task_reaction_value').value = ''
        document.getElementById('btn_task_reaction_finish').setAttribute("data-task-id", parent.getAttribute("data-task-id"))

        return


        console.log(parent.getAttribute("data-task-id"))
        if (this.getAttribute("data-result") === 'yes'){
            showPopup("task_reaction_finish")
            document.getElementById('task_reaction_value').value = ''
            document.getElementById('btn_task_reaction_finish').setAttribute("data-task-id", parent.getAttribute("data-task-id"))
        } else {
            sendTaskReaction(parent.getAttribute("data-task-id"), false)
        }
    }
    document.getElementById('btn_task_reaction_finish').addEventListener('click', function(){
        if (document.getElementById('task_reaction_value').value === '' ) {
            showAlert("Fill in all fields")
            return
        }

        sendTaskReaction(this.getAttribute("data-task-id"), true)
    })
    function sendTaskReaction(task_id, result){

        fetch(
            `${api_url}task_reaction_finish`,
            { method: 'post',
                body: JSON.stringify({
                    task_id:       task_id,
                    reaction_text: document.getElementById('task_reaction_value').value,
                    reaction_result: result
                }),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                showNotify("Saved")
                showProject(json)
                closePopup()


            })
            .catch( error => console.error('error:', error) );
    }


    Array.from(document.querySelectorAll(".btns_project_finish")).forEach(function(element) {
        element.addEventListener('click', finishProject );
    });
    function finishProject(){
        if (document.getElementById('project_finish_feedback').value === ''){
            showAlert("Describe result of project, before completing it")
            return
        }

        let result = this.getAttribute("data-result")
        fetch(
            `${api_url}project_finish`,
            { method: 'post',
                body: JSON.stringify({
                    project_id:       current_project.project.id,
                    project_result:   result,
                    feedback: document.getElementById('project_finish_feedback').value
                }),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                showProject(json)
                closePopup()
                updateProjects()
                if (result == 'true') {
                    showCongratsPage('Congratulations!', 'Project completed')
                }
            })
            .catch( error => console.error('error:', error) );
    }



    let project_type = ''
    let project_manufacturer = ''
    document.getElementById('btn_project_create').onclick = function(){
        changeCurrentPage("project")
        current_project = null
        project_type = ``
        project_manufacturer = ``
        document.getElementById('div_project_create') .style.display = 'flex'
        document.getElementById('div_project_info')       .style.display = 'none'
        document.getElementById('div_project_main')       .style.display = 'none'
        document.getElementById('project_feed')       .style.display = 'none'
        document.getElementById('btn_project_add')       .style.display = 'none'
        document.getElementById('btn_project_edit')       .style.display = 'none'

        document.getElementById('div_project_create_type')      .style.display = 'block'
        document.getElementById('div_project_create_replace')   .style.display = 'none'
        document.getElementById('div_project_create_our')       .style.display = 'none'

        document.getElementById('project_create_type').innerText = ''
        document.getElementById('project_create_country')       .value = ''
        document.getElementById('project_create_type')       .value = ''
        document.getElementById('project_create_rival')        .value = ''
        document.getElementById('project_create_product_rival').value = ''
        document.getElementById('project_create_name').value = ''
        document.getElementById('project_create_desc').value = ''
        document.getElementById('project_create_product_our').value = ''
        document.getElementById('project_create_bulk')       .value = ''
        setProjectStatus(1)
        showNotify("Fill in all fields")
    }

    document.getElementById('project_create_bulk').addEventListener('input', function(){
        if (document.getElementById('btn_project_edit').style.display !== 'block'){
            document.getElementById('btn_project_add').style.display = 'block'
        }
    })
    document.getElementById('btn_project_add').addEventListener('click', function(){


        const project_name = document.getElementById('project_create_name').value
        const project_country = document.getElementById('project_create_country').value
        const project_desc = document.getElementById('project_create_desc').value
        const project_rival = document.getElementById('project_create_rival').value
        const project_product_rival = document.getElementById('project_create_product_rival').value
        const project_product_our = document.getElementById('project_create_product_our').value
        const project_bulk = document.getElementById('project_create_bulk').value

        console.log("project_country ", project_country)
        let error = false
        if ( project_type == '' || project_manufacturer == '' || project_country == '' || project_name == ''  || project_product_our == '' || project_bulk == '' ) {
            error = true
        }
        console.log("error ", error)

        if (project_type == 'replace') {
            if (project_rival == '' || project_product_rival == '' ) {
                error = true
            }
        }

        let body = {
            project_type:          project_type,
            project_manufacturer:          project_manufacturer,
            project_name:          project_name,
            project_country:          project_country,
            project_desc:          project_desc,
            project_rival:         project_rival,
            project_product_rival: project_product_rival,
            project_product_our:   project_product_our,
            project_bulk:          project_bulk,
        }
        console.log("body ", body)

        if (error){
            showAlert("Fill in all fields")
        } else {
            fetch(
                `${api_url}project_create`,
                { method: 'post',
                    body: JSON.stringify(body),
                    headers: {
                        'Authorization': 'Token token=' + cookie_token,
                        'Content-Type': 'application/json'
                    }})
                .then( response => response.json() )
                .then( json => {
                    showProject(json)
                    updateProjects()
                    showNotify("Plan your first project task")
                })
                .catch( error => console.error('error:', error) );
        }
    })



    document.getElementById('btn_open_edit_project').addEventListener('click', function(){
        document.getElementById('div_project_main') .style.display   = 'none'
        document.getElementById('btn_project_edit') .style.display   = 'block'
        document.getElementById('btn_project_add')   .style.display  = 'none'
        document.getElementById('div_project_create') .style.display = 'flex'

        document.getElementById('div_project_info')   .style.display = 'none'
        document.getElementById('div_project_create_type').style.display = 'none'
        document.getElementById('div_project_create_manufacturer').style.display = 'none'


        document.getElementById('div_project_create_our') .style.display = 'block'

        project_type = current_project.project.project_type
        if (project_type === 'replace') {
            document.getElementById('div_project_create_replace').style.display = 'block'
            document.getElementById('project_create_rival')        .value = current_project.project.rival
            document.getElementById('project_create_product_rival').value = current_project.project.product_rival
        } else {
            document.getElementById('div_project_create_replace').style.display = 'none'
        }

        console.log("current_project ", current_project.project.project_type)

        document.getElementById('project_create_name').value = current_project.project.customer_name
        document.getElementById('project_create_desc').value = current_project.project.desc
        document.getElementById('project_create_product_our').value = current_project.project.product_our
        document.getElementById('project_create_bulk')       .value = current_project.project.bulk
    })
    document.getElementById('btn_project_edit').addEventListener('click', function(){

        const project_name = document.getElementById('project_create_name').value
        const project_desc = document.getElementById('project_create_desc').value
        const project_rival = document.getElementById('project_create_rival').value
        const project_product_rival = document.getElementById('project_create_product_rival').value
        const project_product_our = document.getElementById('project_create_product_our').value
        const project_bulk = document.getElementById('project_create_bulk').value

        let error = false
        if ( project_type == '' ||     project_name == '' || project_product_our == '' || project_bulk == '' ) {
            error = true
        }

        if (project_type == 'replace') {
            if (project_rival == '' || project_product_rival == '' ) {
                error = true
            }
        }

        if (error){
            showAlert("Fill in all fields")
        } else {
            fetch(
                `${api_url}project_edit`,
                { method: 'post',
                    body: JSON.stringify({
                        project_id:            this.getAttribute("data-project-id"),
                        project_type:          project_type,
                        project_name:          project_name,
                        project_desc:          project_desc,
                        project_rival:         project_rival,
                        project_product_rival: project_product_rival,
                        project_product_our:   project_product_our,
                        project_bulk:          project_bulk,
                    }),
                    headers: {
                        'Authorization': 'Token token=' + cookie_token,
                        'Content-Type': 'application/json'
                    }})
                .then( response => response.json() )
                .then( json => {
                    showProject(json)
                    updateProjects()
                    showNotify("Saved")
                })
                .catch( error => console.error('error:', error) );
        }
    })


    document.getElementById('project_chat_buyer').addEventListener('click', function(){
        console.log("Chat")
        if (this.src.includes('person')) {
            this.src = 'img/chat_person.svg'
        } else {
            this.src = 'img/chat.svg'
        }
        setChatProject(this.getAttribute("data-project-id"), true)
    })
    document.getElementById('project_chat_manufacturer').addEventListener('click', function(){
        console.log("Chat")

        if (this.src.includes('person')) {
            this.src = 'img/chat_person.svg'
        } else {
            this.src = 'img/chat.svg'
        }

        //document.getElementById('new_chat_message_manufacturer').style.display = 'none'
        setChatProject(this.getAttribute("data-project-id"), true)
    })



    function updateProjectProducts(project_manufacturer){

        let manufacturer_id = main_data.manufacturers_real.filter(m => m.name == project_manufacturer)[0].id
        let products = []
        main_data.products.forEach(function(item) {
            if (item.manufacturer_id == manufacturer_id) {
                products.push(item.name);
            }

        });


        autocomplete(document.getElementById("project_create_product_our"), products, false);

    }
    /////  - MANAGE PROJECTS ////








    ///// + MANAGE CHATS ////
    function openChatProduct(){
        console.log("Chat")
        console.log(this)

        let parent = this.parentElement.parentElement
        parent.classList.remove('new_message')

        const img = this.getElementsByTagName('img')[0]
        console.log(img)
        if (img.src.includes("chat_person")) {
            img.src = "img/chat_person.svg"
        } else {
            img.src = "img/chat.svg"
        }


        let product_id = parent.getAttribute("data-product-id")

        fetch(
            `${api_url}get_product_messages`,
            { method: 'post',
                body: JSON.stringify({
                    product_id: product_id
                }),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                const header = `Product ${json.product.name}`
                openChat("product", header, json.messages)

                document.getElementById('product_message_send').setAttribute("data-type", "product")
                document.getElementById('product_message_send').setAttribute("data-product-id", product_id)

                updateNewMessages()
            })
            .catch( error => console.error('error:', error) );
    }
    function openChatSupply(e){
        e.preventDefault()
        e.stopPropagation()

        console.log("Chat")

        let parent = this.parentElement.parentElement
        parent.classList.remove('new_message')

        const img = this.getElementsByTagName('img')[0]
        if (img.src.includes("chat_person")) {
            img.src = "img/chat_person.svg"
        } else {
            img.src = "img/chat.svg"
        }


        let supply_id = parent.getAttribute("data-supply-id")
        fetch(
            `${api_url}get_supply_messages`,
            { method: 'post',
                body: JSON.stringify({
                    supply_id: supply_id
                }),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                openChat("supply", json.header, json.messages)

                document.getElementById('product_message_send').setAttribute("data-type", "supply")
                document.getElementById('product_message_send').setAttribute("data-supply-id", supply_id)
                updateNewMessages()
            })
            .catch( error => console.error('error:', error) );
    }
    function openClaimChat(e){
        e.preventDefault()
        e.stopPropagation()
        let supply_id = this.parentElement.parentElement.getAttribute("data-supply-id")

        this.setAttribute("src", "img/claim_chat.svg")
        sendRequest("post", 'supply_claim_chat', {supply_id: supply_id})
            .then(data => {
                openChat("supply", data.header, data.messages)
                document.getElementById('product_message_send').setAttribute("data-claimed", true)
                document.getElementById('product_message_send').setAttribute("data-type", "supply")
                document.getElementById('product_message_send').setAttribute("data-supply-id", supply_id)
                updateNewMessages()
            })
    }
    function openChatProject(e){
        console.log("Chat", e)
        let parent = this.parentElement
        parent.classList.remove('new_message')
        if (this.src.includes("chat_person")) {
            this.src = "img/chat_person.svg"
        } else {
            this.src = "img/chat.svg"
        }


        let project_id = parent.getAttribute("data-project-id")
        document.getElementById('product_message_send').setAttribute("data-type", "project")
        document.getElementById('product_message_send').setAttribute("data-project-id", project_id)

        setChatProject(project_id, true)

        e.stopPropagation();

    }

    function openChat(messages_type, chat_header, messages){
        let chat_container = document.getElementsByClassName('div_order_chat_messages')[0]
        chat_container.innerHTML  = ''

        messages.forEach(function(item, i, arr) {

            let file_img = ''
            let file_download = ''
            let file_name = ''
            if (item.file_link != null) {
                file_img = '<div class="div_img"><img src="img/file.svg"/></div>'
                file_download = 'message_file_download'
                file_name = item.message
            }


            if (item.if_user) {
                chat_container.innerHTML +=
                    `<div class="div_message mine ${file_download}" data-message-id="${item.id}" data-file-name="${item.file_name}">
                        <div class="order_message">
                            ${file_img}
                            <div class="value">${item.message}</div>
                            <div class="date">${item.datetime}</div>
                        </div>
                        <img class="message_sender" src="${item.sender_avatar}" data-tippy-content="${item.sender_name}" />
                     </div>`
            } else {
                chat_container.innerHTML +=
                    `<div class="div_message ${file_download}" data-message-id="${item.id}" data-file-name="${item.file_name}">
                        <img class="message_sender" src="${item.sender_avatar}" data-tippy-content="${item.sender_name}" />
                        <div class="order_message">
                            ${file_img}
                            <div class="value">${item.message}</div>
                            <div class="date">${item.datetime}</div>
                        </div>
                     </div>`
            }


        });

        let div_chat = document.getElementById(`div_chat`)
        document.getElementById(`div_chat_name`).innerText = chat_header
        div_chat.style.display = 'block'
        div_chat.style.removeProperty('inset')


        Array.from(document.getElementsByClassName("message_file_download")).forEach(function(element) {
            element.addEventListener('click', messageFileDownload)
        });
        document.getElementsByClassName('div_order_chat_messages')[0].scrollTo(100000,100000)
        tippy('.message_sender', {
            content: 'My tooltip!',
            followCursor: 'horizontal',
            animation: 'fade',
        });
    }
    let message_file_name = ''
    function messageFileDownload(){
        message_file_name = this.getAttribute("data-file-name")
        downloadMessageFile(this.getAttribute("data-message-id"))
    }

    function downloadMessageFile(message_id){
        const formData  = new FormData();
        formData.append("message_id", message_id);

        const headers = {
            'Authorization': 'Token token=' + cookie_token,
            //'Content-type': 'application/json'
        }

        fetch(`${api_url}download_message_file`, {
            method: "post",
            headers: headers,
            body: formData
        }).then(response => response.blob() )
            .then(blob => {
                var url = window.URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = message_file_name;
                document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
                a.click();
                a.remove();  //afterwards we remove the element again
            });
    }

    document.getElementById('product_message_send_file').onclick = function(){
        showPopup("message_file")
        document.getElementById('message_file_name').value = ""
        document.getElementById('send_message_file').click()

    }
    document.getElementById('message_file_name').onclick = function(){
        document.getElementById('send_message_file').click()
    }
    document.getElementById('send_message_file').onchange = function(){
        console.log("change ", this.files);
        console.log("change ", this.files[0]);
        document.getElementById('message_file_name').value = this.files[0].name

    }
    document.getElementById('btn_send_message_file').onclick = function(){
        const formData = new FormData();
        const file_value = document.getElementById('send_message_file');
        const file_name  = document.getElementById('message_file_name').value;

        formData.append('sender_id', main_data.user.id);
        formData.append('file_name', file_name);
        formData.append('file', file_value.files[0]);

        let btn_with_info = document.getElementById('product_message_send')
        formData.append('message_type', btn_with_info.getAttribute("data-type"))
        formData.append('project_id',   btn_with_info.getAttribute("data-project-id"))
        formData.append('product_id',   btn_with_info.getAttribute("data-product-id"))
        formData.append('supply_id',    btn_with_info.getAttribute("data-supply-id"))
        formData.append('token',        cookie_token)
        formData.append('claimed',      btn_with_info.getAttribute("data-claimed"))


        if (file_value.files.length == 0) {
            showAlert("Select file")
            return;
        }

        fetch(api_url + 'save_file_for_message', {
            method: 'PUT',
            body: formData
        })
            .then((response) => response.json())
            .then((data) => {
                console.log('Success:', data);
                openChat(btn_with_info.getAttribute("data-type"), data.header, data.messages)
                closePopup()
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }
    document.getElementById('product_message_send').onclick = function(){
        let message_value = document.getElementById('product_message_text').value
        if (message_value.length < 1) {
            showAlert("Message must not be empty")
            return
        }

        let now = new Date();

        document.getElementsByClassName('div_order_chat_messages')[0].innerHTML +=
            `<div class="div_message mine">
                 <div class="order_message">
                     <div class="value">${message_value}</div>
                     <div class="date">${now.getHours()}:${now.getMinutes()}  ${getDateToday()}</div>
                 </div>
                 <img class="message_sender" src="${main_data.user.avatar}" />
            </div>`

        //this.src = 'img/chat_person.svg'
        document.getElementById('project_chat_buyer').src = 'img/chat_person.svg'
        document.getElementById('project_chat_manufacturer').src = 'img/chat_person.svg'


        document.getElementById('product_message_text').value = ''
        document.getElementById('product_message_text').style.height = '17px'

        document.getElementsByClassName('div_order_chat_messages')[0].scrollTo(10000,10000)

        let selector = ''
        switch (this.getAttribute("data-type")) {
            case "product":
                selector = `.list-ordered-product[data-product-id="${this.getAttribute("data-product-id")}"]`

                Array.from(document.querySelectorAll(selector)).forEach(function(element) {
                    Array.from(element.querySelectorAll('.open_chat_products')).forEach(function(chat_img) {
                        chat_img.src = 'img/chat_person.svg'
                    })
                })
                break;
            case "supply":
                selector = `.list-item-supply[data-supply-id="${this.getAttribute("data-supply-id")}"]`

                Array.from(document.querySelectorAll(selector)).forEach(function(element) {
                    Array.from(element.querySelectorAll('.open_chat_supplies')).forEach(function(chat_img) {
                        chat_img.src = 'img/chat_person.svg'
                    })
                })
                break;
            case "project":
                selector = `.list-project-user[data-project-id="${this.getAttribute("data-project-id")}"]`

                Array.from(document.querySelectorAll(selector)).forEach(function(element) {
                    Array.from(element.querySelectorAll('.open_chat_projects')).forEach(function(chat_img) {
                        chat_img.src = 'img/chat_person.svg'
                    })
                })
                break;
        }

        //<div id="product_message_send" data-type="product" data-product-id="1099">


        let message_type = this.getAttribute("data-type")

        fetch(
            `${api_url}add_message`,
            { method: 'post',
                body: JSON.stringify({
                    message:  message_value,
                    project_id: this.getAttribute("data-project-id"),
                    product_id: this.getAttribute("data-product-id"),
                    supply_id: this.getAttribute("data-supply-id"),
                    message_type: message_type,
                    claimed: this.getAttribute("data-claimed"),
                }),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                openChat(message_type, json.header, json.messages)
            })
            .catch( error => console.error('error:', error) );
    }

    ///// - MANAGE CHATS ////











    ///// + MANAGE ANALYTICS ////
    let buyer_analytic_filter_products  = null
    let analytic_filter = {}
    let filter_dd_analytic_regions = null
    let filter_dd_analytic_year    = null
    let filter_dd_analytic_period  = null
    let filter_dd_analytic_quarter = null
    let filter_dd_analytic_month   = null
    let filter_dd_analytic_budget  = null

    function setBuyerAnalyticFilters(){
        console.log("setBuyerAnalyticFilters2 ", analytic_filter)
        buyer_analytic_filter_products.setValue(analytic_filter.product)

        let period_name = document.querySelectorAll(`.btns-analytic-period[data-value="${analytic_filter.period}"]`)[0].textContent
        let year_name   = document.querySelectorAll(`.btns-analytic-year[data-value="${analytic_filter.year}"]`)[0].textContent

        document.getElementById('filter_buyer_analytic_period').innerText = analytic_filter.period == "year" ?  "Period: " + period_name : period_name
        document.getElementById('filter_buyer_analytic_year').innerText   = year_name

        let text = 'Select'
        let display = 'none'
        if (analytic_filter.quarter != null) {
            text = `Q${analytic_filter.quarter}`
            display = 'flex'
        }
        if (analytic_filter.period == 'quarter') {
            display = 'flex'
        }
        document.getElementById('filter_buyer_analytic_quarter').innerText = text
        document.getElementById('div_filter_buyer_analytic_quarter').style.display  = display

        text = 'Select'
        display = 'none'
        if (analytic_filter.month != null) {
            text = getMonthName(analytic_filter.month)
            display = 'flex'
        }
        if (analytic_filter.period == 'month') {
            display = 'flex'
        }
        document.getElementById('div_filter_buyer_analytic_month').style.display   = display
        document.getElementById('filter_buyer_analytic_month').innerText  = text
        document.getElementById('filter_buyer_analytic_budget').innerText = getRafName(analytic_filter.raf)
    }
    function createAnalyticFilterProducts(){
        let html = ''
        let products = main_data.products.filter(item => {
            return item.manufacturer_id == buyer_manufacturer.id
        })

        products.forEach((item, i) => {
            html += `<option class="analytic_filter_product" data-value="${item.name}">${item.name}</option>`
        })
        document.getElementById("buyer_analytic_filter_products").innerHTML = html
        buyer_analytic_filter_products = new vanillaSelectBox(
            "#buyer_analytic_filter_products",
            {"maxHeight":300,
                search:true,
                translations : { "all": "All products", "items": "products"}
            })

        analytic_filter.product = products.map(p => p.name)
        buyer_analytic_filter_products.setValue(products.map(p => p.name))
        Array.from(document.querySelectorAll(".analytic_filter_product")).forEach(function(element) {
            element.addEventListener('click', showBtnAnalyticUpdate );
        })

        function showBtnAnalyticUpdate(){
            setTimeout(() => {
                if (this.classList.contains('analytic_filter_product')) {
                    analytic_filter.product = buyer_analytic_filter_products.getResult()
                }
                console.log("analytic_filter ", analytic_filter)
                setCookie(cookie_name_analytic, JSON.stringify(analytic_filter))
                this.parentElement.parentElement.parentElement.parentElement.parentElement.classList.add('updated')
                document.getElementById('div_buyer_analytic_container').style.display  = 'none'
                document.getElementById('div_btn_buyer_analytic_filter').style.display = 'block'

            }, 200)
        }
    }
    document.getElementById('div_btn_buyer_analytic_filter').onclick = function (){

        setBuyerAnalytic()
    }

    let analytic_filter_regions   = null
    let analytic_filter_customers = null
    let analytic_filter_products  = null
    function createBuyerAnalyticFilters() {
        filter_dd_analytic_year    = new Dropmic(document.getElementById('dd_filter_buyer_analytic_year'));
        filter_dd_analytic_period  = new Dropmic(document.getElementById('dd_filter_buyer_analytic_period'));
        filter_dd_analytic_quarter = new Dropmic(document.getElementById('dd_filter_buyer_analytic_quarter'));
        filter_dd_analytic_month   = new Dropmic(document.getElementById('dd_filter_buyer_analytic_month'));
        filter_dd_analytic_budget  = new Dropmic(document.getElementById('dd_filter_buyer_analytic_budget'));



        getAnalyticFiltersBase()
        createAnalyticFilterProducts()

        onClickAnalyticItem()

        function getAnalyticFiltersBase(){
            const filters_source = getCookie(cookie_name_analytic)

            if (typeof filters_source !== 'undefined' && filters_source !== 'undefined') {
                analytic_filter = JSON.parse(filters_source)

            } else {
                let regions = []
                user_regions.split(",").forEach(r => regions.push(getRegionNameFromCode(r)))

                analytic_filter = {
                    regions: regions,
                    period: 'year',
                    year:    new Date().getFullYear(),
                    quarter: null,
                    month:   null,
                    raf:  4,
                    product: main_data.products.map(p => p.name),
                    company: main_data.cabinet_info.name }
                setCookie(cookie_name_analytic,  JSON.stringify(analytic_filter))

            }
        }


        function onClickAnalyticItem(){
            Array.from(document.querySelectorAll(".btns-analytic-filter")).forEach(function(element) {
                element.addEventListener('click', changeAnalyticFilter );
            })

            function changeAnalyticFilter(){
                let class_name = this.classList[2]
                let parent = this.parentElement.parentElement.parentElement.parentElement

                switch (class_name) {
                    case "btns-analytic-period":
                        filter_dd_analytic_period.close()
                        document.getElementById('div_filter_buyer_analytic_month').style.display = `none`
                        document.getElementById('div_filter_buyer_analytic_quarter').style.display = `none`

                        analytic_filter.period = this.getAttribute("data-value")
                        switch (this.getAttribute("data-value")){
                            case "month":
                                analytic_filter.quarter = null
                                document.getElementById('div_filter_buyer_analytic_month').style.display = `flex`
                                break;
                            case "quarter":
                                analytic_filter.month = null
                                document.getElementById('div_filter_buyer_analytic_quarter').style.display = `flex`
                                break;
                            case "year":
                                analytic_filter.month = null
                                analytic_filter.quarter = null
                                break;
                        }

                        break;
                    case "btns-analytic-year":
                        filter_dd_analytic_year.close()
                        analytic_filter.year = this.getAttribute("data-value")
                        break;
                    case "btns-analytic-quarter":
                        filter_dd_analytic_quarter.close()
                        analytic_filter.quarter = this.getAttribute("data-value")
                        break;
                    case "btns-analytic-month":
                        filter_dd_analytic_month.close()
                        analytic_filter.month = this.getAttribute("data-value")
                        break;
                    case "btns-analytic-budget":
                        filter_dd_analytic_budget.close()
                        analytic_filter.raf = this.getAttribute("data-value")
                        break;
                }
                parent.classList.add("updated")


                setBuyerAnalyticFilters()

                document.getElementById('div_buyer_analytic_container').style.display = 'none'
                document.getElementById('div_btn_buyer_analytic_filter').style.display = 'block'

            }
        }
    }
    function createManufacturerAnalyticFilters() {
        getAnalyticFiltersBase()
        createAnalyticFilterRegions()
        createAnalyticFilterCustomers()
        createAnalyticFilterProducts()

        onClickAnalyticItem()

        function getAnalyticFiltersBase(){
            const filters_source = getCookie(cookie_name_analytic)

            if (typeof filters_source !== 'undefined' && filters_source !== 'undefined') {
                analytic_filter = JSON.parse(filters_source)

            } else {
                let regions = []
                user_regions.split(",").forEach(r => regions.push(getRegionNameFromCode(r)))

                analytic_filter = {
                    regions: regions,
                    period: 'year',
                    year:    new Date().getFullYear(),
                    quarter: null,
                    month:   null,
                    raf:  4,
                    product: main_data.products.map(p => p.name),
                    company: main_data.buyers.map(b => b.name)}
                setCookie(cookie_name_analytic,  JSON.stringify(analytic_filter))

            }
        }

        function createAnalyticFilterRegions(){
            let html = ''
            user_regions.split(",").forEach((item, i) => {
                html += `<option class="analytic_filter_region" data-value="${getRegionNameFromCode(item)}">${getRegionNameFromCode(item)}</option>`
            })
            document.getElementById("analytic_filter_regions").innerHTML = html
            analytic_filter_regions = new vanillaSelectBox(
                "#analytic_filter_regions",
                {"maxHeight":300,
                    search:true,
                    translations : { "all": "All regions", "items": "regions"}
                })
        }

        function createAnalyticFilterCustomers(){
            let html = ''
            main_data.buyers.map(a => a.name).forEach((item, i) => {
                html += `<option class="analytic_filter_customer" data-value="${item}">${item}</option>`
            })
            document.getElementById("analytic_filter_customers").innerHTML = html
            analytic_filter_customers = new vanillaSelectBox(
                "#analytic_filter_customers",
                {"maxHeight":300,
                    search:true,
                    translations : { "all": "All customers", "items": "customers"},
                    childClassName: 'analytic_filter_customer'
                })
        }

        function createAnalyticFilterProducts(){
            let products = main_data.products.map(a => a.name)
            let html = ''
            products.forEach((item, i) => {
                html += `<option class="analytic_filter_product" data-value="${item}">${item}</option>`
            })
            document.getElementById("analytic_filter_products").innerHTML = html
            analytic_filter_products = new vanillaSelectBox(
                "#analytic_filter_products",
                {"maxHeight":300,
                    search:true,
                    translations : { "all": "All products", "items": "products"}
                })
        }


        function onClickAnalyticItem(){
            Array.from(document.querySelectorAll(".btns-analytic-filter")).forEach(function(element) {
                element.addEventListener('click', changeAnalyticFilter );
            });

            function changeAnalyticFilter(){
                let class_name = this.classList[2]
                let parent = this.parentElement.parentElement.parentElement.parentElement

                switch (class_name) {
                    case "btns-analytic-period":
                        filter_dd_analytic_period.close()
                        document.getElementById('div_filter_analytic_month').style.display = `none`
                        document.getElementById('div_filter_analytic_quarter').style.display = `none`

                        document.getElementById('div_graph_average_price').style.display = `block`
                        analytic_filter.period = this.getAttribute("data-value")
                        switch (this.getAttribute("data-value")){
                            case "month":
                                analytic_filter.quarter = null
                                document.getElementById('div_filter_analytic_month').style.display = `flex`
                                document.getElementById('div_graph_average_price').style.display = `none`
                                break;
                            case "quarter":
                                analytic_filter.month = null
                                document.getElementById('div_filter_analytic_quarter').style.display = `flex`
                                break;
                            case "year":
                                analytic_filter.month = null
                                analytic_filter.quarter = null
                                break;
                        }

                        break;
                    case "btns-analytic-year":
                        filter_dd_analytic_year.close()
                        analytic_filter.year = this.getAttribute("data-value")
                        break;
                    case "btns-analytic-quarter":
                        filter_dd_analytic_quarter.close()
                        analytic_filter.quarter = this.getAttribute("data-value")
                        break;
                    case "btns-analytic-month":
                        filter_dd_analytic_month.close()
                        analytic_filter.month = this.getAttribute("data-value")
                        break;
                    case "btns-analytic-budget":
                        filter_dd_analytic_budget.close()
                        analytic_filter.raf = this.getAttribute("data-value")
                        break;
                }
                parent.classList.add("updated")

                setCookie(cookie_name_analytic, JSON.stringify(analytic_filter))

                setManufacturerAnalyticFilters()

                document.getElementById('div_analytic_container').style.display = 'none'
                document.getElementById('div_btn_analytic_filter').style.display = 'block'

            }

            Array.from(document.querySelectorAll(".analytic_filter_region, .analytic_filter_customer, .analytic_filter_product")).forEach(function(element) {
                element.addEventListener('click', showBtnAnalyticUpdate );
            });

            function showBtnAnalyticUpdate(){
                setTimeout(() => {
                    if (this.classList.contains('analytic_filter_product')) {
                        analytic_filter.product = analytic_filter_products.getResult()
                    } else if (this.classList.contains('analytic_filter_customer')) {
                        let selected_customers = analytic_filter_customers.getResult()
                        console.log("selected_customers ", selected_customers)
                        let selected_customers_regions = []
                        selected_customers.forEach((c) => {
                            let region = main_data.buyers.filter((b) => { return b.name == c  })[0].region

                            if (!selected_customers_regions.includes(region)) {
                                selected_customers_regions.push(region)
                            }
                        })

                        let selected_customers_regions_names = []
                        selected_customers_regions.forEach(r => {selected_customers_regions_names.push(getRegionNameFromCode(r))})

                        if (selected_customers_regions_names.length === 0) {
                            selected_customers_regions = user_regions.split(",")
                            selected_customers_regions.forEach(r => {selected_customers_regions_names.push(getRegionNameFromCode(r))})
                        }

                        analytic_filter_regions.setValue(selected_customers_regions_names)
                        analytic_filter.regions = selected_customers_regions
                        analytic_filter.company = selected_customers

                    } else if (this.classList.contains('analytic_filter_region')) {
                        let selected_regions = analytic_filter_regions.getResult()

                        let new_customers = main_data.buyers.filter((buyer) => {
                            if (selected_regions.includes(buyer.region)) {
                                return buyer
                            }
                        })

                        if (selected_regions.length === 0) {
                            new_customers = main_data.buyers
                        }
                        analytic_filter_customers.setValue(new_customers.map(p => p.name))
                        analytic_filter.regions = selected_regions
                        analytic_filter.company = new_customers.map(p => p.name)
                    }

                    console.log("analytic_filter ", analytic_filter)
                    setCookie(cookie_name_analytic, JSON.stringify(analytic_filter))
                    this.parentElement.parentElement.parentElement.parentElement.parentElement.classList.add('updated')
                    document.getElementById('div_analytic_container').style.display  = 'none'
                    document.getElementById('div_btn_analytic_filter').style.display = 'block'

                }, 200)
            }
        }
    }
    function setManufacturerAnalyticFilters(){
        analytic_filter_regions.setValue(analytic_filter.regions)
        analytic_filter_customers.setValue(analytic_filter.company)
        analytic_filter_products.setValue(analytic_filter.product)



        let period_name = document.querySelectorAll(`.btns-analytic-period[data-value="${analytic_filter.period}"]`)[0].textContent
        let year_name   = document.querySelectorAll(`.btns-analytic-year[data-value="${analytic_filter.year}"]`)[0].textContent



        document.getElementById('filter_analytic_period').innerText = analytic_filter.period == "year" ?  "Period: " + period_name : period_name

        document.getElementById('filter_analytic_year').innerText   = year_name


        let text = 'Select'
        if (analytic_filter.quarter != null) {
            text = `Q${analytic_filter.quarter}`
            document.getElementById('div_filter_analytic_quarter').style.display = `flex`
        }
        document.getElementById('filter_analytic_quarter').innerText = text

        text = 'Select'
        if (analytic_filter.month != null) {
            text = getMonthName(analytic_filter.month)
            document.getElementById('div_filter_analytic_month').style.display = `flex`
        }
        document.getElementById('filter_analytic_month').innerText = text


        document.getElementById('filter_analytic_budget').innerText   = getRafName(analytic_filter.raf)

    }
    async  function setManufacturerAnalytic(){
        const btn = document.getElementById('div_btn_analytic_filter')
        const text = document.getElementById('text_analytic_filter')
        btn.style.display = 'none'
        text.style.display = 'block'

        if (analytic_filter.period === 'quarter' && analytic_filter.quarter === null){
            return
        }
        if (analytic_filter.period === 'month' && analytic_filter.month === null){
            return
        }

        fetch(
            `${api_url}get_manufacturer_analytic`,
            {   method: 'POST',
                body: JSON.stringify(analytic_filter),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                text.style.display = 'none'
                analytic_data = json.analytic

                //console.log("analytic_data ", analytic_data)
                showManufacturerAnalytic()
                document.getElementById('div_graph_monthes').style.display = `block`
                if (analytic_filter.period === 'month'){
                    document.getElementById('div_graph_monthes').style.display = `none`
                }

                document.getElementById('div_analytic_container').style.display = 'block'
                document.getElementById('div_btn_analytic_filter').style.display = 'none'

                document.getElementById('div_analytic_tables').style.display = 'none'

                Array.from(document.getElementsByClassName("table_data")).forEach(function(element) {
                    element.style.display = 'none'
                });


            })
            .catch( error => console.error('error:', error) );
    }
    document.getElementById('div_btn_analytic_filter').onclick = function (){

        setManufacturerAnalytic()
    }



    let analytic_filters = {zone: '', period: '', slic: '', }
    Array.from(document.getElementsByClassName("dd_analytic_zone")).forEach(function(element) {
        element.addEventListener('click', analyticSetZone)
    });
    function analyticSetZone(){
        analytic_filters.zone = this.getAttribute("data-result")
        let parent = this.parentElement.parentElement.parentElement
        parent.getElementsByClassName('more')[0].innerText = this.innerText

        console.log("analytic_filters ", analytic_filters)
    }
    Array.from(document.getElementsByClassName("dd_analytic_period")).forEach(function(element) {
        element.addEventListener('click', analyticSetPeriod)
    });
    function analyticSetPeriod(){
        analytic_filters.period = this.getAttribute("data-result")
        let parent = this.parentElement.parentElement.parentElement
        parent.getElementsByClassName('more')[0].innerText = this.innerText
    }
    Array.from(document.getElementsByClassName("dd_analytic_slice")).forEach(function(element) {
        element.addEventListener('click', analyticSetSlice)
    });
    function analyticSetSlice(){
        analytic_filters.slice = this.getAttribute("data-result")
        let parent = this.parentElement.parentElement.parentElement
        parent.getElementsByClassName('more')[0].innerText = this.innerText
    }


    let graph_business_overview_weight = null
    let graph_business_overview_money  = null
    let graph_regions_weight = null
    let graph_regions_money  = null
    let graph_monthes_weight = null
    let graph_monthes_money  = null
    let graph_average_price_category  = null
    let graph_average_price_vs_volume_monthes  = null

    function setBuyerAnalytic() {

        const btn = document.getElementById('div_btn_buyer_analytic_filter')
        const text = document.getElementById('text_buyer_analytic_filter')
        btn.style.display = 'none'
        text.style.display = 'block'

        if (analytic_filter.period === 'quarter' && analytic_filter.quarter === null){
            return
        }
        if (analytic_filter.period === 'month' && analytic_filter.month === null){
            return
        }

        analytic_filter.manufacturer_id = buyer_manufacturer.id
        setCookie(cookie_name_analytic, JSON.stringify(analytic_filter))



        fetch(
            `${api_url}get_buyer_analytic`,
            {   method: 'POST',
                body: JSON.stringify(analytic_filter),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                analytic_data = json.analytic
                console.log("get_buyer_analytic ", analytic_data)

                text.style.display = 'none'
                showBuyerAnalytic()
                document.getElementById('div_buyer_graph_monthes').style.display = `block`
                if (analytic_filter.period === 'month'){
                    document.getElementById('div_buyer_graph_monthes').style.display = `none`
                }

                document.getElementById('div_buyer_analytic_container').style.display = 'block'
                document.getElementById('div_btn_buyer_analytic_filter').style.display = 'none'

                document.getElementById('div_buyer_analytic_tables').style.display = 'none'

                Array.from(document.getElementsByClassName("table_data")).forEach(function(element) {
                    element.style.display = 'none'
                });
            })
            .catch( error => console.error('error:', error) );
    }
    function showBuyerAnalytic() {
        Array.from(document.getElementsByClassName("table_data ")).forEach(function(element) {
            element.style.display =  'none'
        })

        showBusinessOverview("buyer")
        createOverviewTable("buyer")

        showGraphMonthes("buyer")



        // ИНДУСТРИИ
        drawGraphPie('div_buyer_graph_industries', "industry_tons")
        drawGraphPie('div_buyer_graph_industries', "industry_cash")




        // КАТЕГОРИЯ 1
        let div_display = 'none'
        if (analytic_data.current_period.category_1_tons_labels.length > 0){
            div_display = 'flex'
            document.querySelector("#div_buyer_graph_category_1 .analytic_header_main").innerText = analytic_data.current_period.category_1_name
            drawGraphPie('div_buyer_graph_category_1', "category_1_tons")
            drawGraphPie('div_buyer_graph_category_1', "category_1_cash")
        }
        document.querySelector("#div_buyer_graph_category_1").style.display = div_display


        // КАТЕГОРИЯ 2
        div_display = 'none'
        if (analytic_data.current_period.category_2_tons_labels.length > 0){
            div_display = 'flex'
            document.querySelector("#div_buyer_graph_category_2 .analytic_header_main").innerText = analytic_data.current_period.category_2_name
            drawGraphPie('div_buyer_graph_category_2', "category_2_tons")
            drawGraphPie('div_buyer_graph_category_2', "category_2_cash")
        }
        document.querySelector("#div_buyer_graph_category_2").style.display = div_display


        // КАТЕГОРИЯ 3
        div_display = 'none'
        if (analytic_data.current_period.category_3_tons_labels.length > 0){
            div_display = 'flex'
            document.querySelector("#div_buyer_graph_category_3 .analytic_header_main").innerText = analytic_data.current_period.category_3_name
            drawGraphPie('div_buyer_graph_category_3', "category_3_tons")
            drawGraphPie('div_buyer_graph_category_3', "category_3_cash")
        }
        document.querySelector("#div_buyer_graph_category_3").style.display = div_display


    }

    function showBusinessOverview(for_whom){
        console.log("showBusinessOverview ", analytic_data)
        for_whom = for_whom == "buyer" ? "buyer_" : ""

        let show_graph = true
        if (analytic_data.prev_period.total_tons == 0 &&
            analytic_data.raf.total_tons == 0 &&
            analytic_data.current_period.total_tons == 0) {
            show_graph = false
        }
        console.log("show_graph ", show_graph)

        let parent = document.getElementById(`div_${for_whom}analytic_container`)

        document.getElementById(`graph_${for_whom}business_overview_weight`) .style.display = show_graph ? "flex" : "none"
        document.getElementById(`graph_${for_whom}business_overview_money`)  .style.display = show_graph ? "flex" : "none"

        Array.from(parent.getElementsByClassName("analytics_no_data")).forEach(function(element) {
            element.style.display = show_graph ? "none" : "flex"
        })
        Array.from(parent.getElementsByClassName("div_analytic_conclusion")).forEach(function(element) {
            element.style.display = show_graph ? "flex" : "none"
        })
        Array.from(parent.getElementsByClassName("container_action_btn")).forEach(function(element) {
            element.style.display = show_graph ? "flex" : "none"
        })
        if (show_graph == false){
            return
        }

        Array.from(document.getElementsByClassName("analytic_raf_name")).forEach(function(element) {
            element.innerText = analytic_data.textes.raf_name
        })



        let labels = [
            analytic_data.textes.prev_period,
            analytic_data.textes.raf,
            analytic_data.textes.current_period
        ]

        let options = {
            indexAxis: 'y',
            responsive: true,
            plugins: {
                legend: {display: false},
                layout: {
                    padding: {
                        left: 20,
                        right: 20,
                        top: 15,
                        bottom: 0
                    }
                },
                scales: {
                    x: [{
                        ticks: {
                            beginAtZero: true,
                            display: true
                        }
                    }]
                },
            }


        }

        var ctx = document.getElementById(`graph_${for_whom}business_overview_weight`).getContext('2d');
        // let gradient_tons_old = ctx.createLinearGradient(50, 0, 440, 0);
        //     gradient_tons_old.addColorStop(0, window.chartColors.grad_start_tons_f1);
        //     gradient_tons_old.addColorStop(1, window.chartColors.grad_end_tons_f1);
        let gradient_tons_raf = ctx.createLinearGradient(440, 0, 50, 0);
        gradient_tons_raf.addColorStop(0, window.chartColors.grad_start_tons_p2);
        gradient_tons_raf.addColorStop(1, window.chartColors.grad_end_tons_p2);
        let gradient_tons_new = ctx.createLinearGradient(440, 0, 50, 0);
        gradient_tons_new.addColorStop(0, window.chartColors.grad_start_tons_f2);
        gradient_tons_new.addColorStop(1, window.chartColors.grad_end_tons_f2);

        var overview_weight_data = {
            labels: labels,
            datasets: [{
                backgroundColor: [
                    window.chartColors.grad_start_tons_f1,
                    gradient_tons_raf,
                    gradient_tons_new],
                borderRadius: 3,
                data: [analytic_data.prev_period.total_tons,
                    analytic_data.raf.total_tons,
                    analytic_data.current_period.total_tons],
                //data: [30, 40, 50],
            }]
        };
        if (graph_business_overview_weight != null) graph_business_overview_weight.destroy()
        graph_business_overview_weight = new Chart(ctx, {
            type:    'bar',
            data:    overview_weight_data,
            options: options
        });

        var ctx = document.getElementById(`graph_${for_whom}business_overview_money`).getContext('2d');
        // let gradient_cash_old = ctx.createLinearGradient(50, 0, 440, 0);
        //     gradient_cash_old.addColorStop(0, window.chartColors.grad_start_cash_f1);
        //     gradient_cash_old.addColorStop(1, window.chartColors.grad_end_cash_f1);
        let gradient_cash_raf = ctx.createLinearGradient(440, 0, 50, 0);
        gradient_cash_raf.addColorStop(0, window.chartColors.grad_start_cash_p2);
        gradient_cash_raf.addColorStop(1, window.chartColors.grad_end_cash_p2);
        let gradient_cash_new = ctx.createLinearGradient(440, 0, 50, 0);
        gradient_cash_new.addColorStop(0, window.chartColors.grad_start_cash_f2);
        gradient_cash_new.addColorStop(1, window.chartColors.grad_end_cash_f2);

        var overview_money_data = {
            labels: labels,
            datasets: [{
                backgroundColor: [
                    window.chartColors.grad_start_cash_f1,
                    gradient_cash_raf,
                    gradient_cash_new],
                borderRadius: 3,
                data: [analytic_data.prev_period.total_cash,
                    analytic_data.raf.total_cash,
                    analytic_data.current_period.total_cash],
                //data: [70, 40, 50],
            }]
        };
        if (graph_business_overview_money != null) graph_business_overview_money.destroy()
        graph_business_overview_money = new Chart(ctx, {
            type:    'bar',
            data:    overview_money_data,
            options: options
        });





        Array.from(document.getElementsByClassName("analytic_conclusion")).forEach(function(element) {
            element.classList.remove('increase')
            element.classList.remove('decrease')
        });

        const total_tons_forecast = document.getElementById(`total_tons_${for_whom}forecast`)
        const total_tons_vs_prev  = document.getElementById(`total_tons_${for_whom}vs_prev`)

        total_tons_forecast.innerHTML = `${analytic_data.compare_data.overview.total_tons_forecast}%`
        total_tons_vs_prev.innerHTML  = `${analytic_data.compare_data.overview.total_tons_vs_prev}%`

        const total_cash_forecast = document.getElementById(`total_cash_${for_whom}forecast`)
        const total_cash_vs_prev  = document.getElementById(`total_cash_${for_whom}vs_prev`)

        total_cash_forecast.innerHTML = `${analytic_data.compare_data.overview.total_cash_forecast}%`
        total_cash_vs_prev.innerHTML = `${analytic_data.compare_data.overview.total_cash_vs_prev}%`
    }
    function createOverviewTable(for_whom){
        let current = analytic_data.current_period.analytics_products
        let prev    = analytic_data.prev_period.analytics_products



        let table_value = `
                    <tr>
                        <th></th>
                        <th colspan="3" style="text-align: center">KG</th>
                        <th colspan="3" style="text-align: center">USD</th>
                    </tr> `
        table_value += `
                    <tr>
                        <th></th>
                        <th>${analytic_data.textes.prev_period}</th>
                        <th>${analytic_data.textes.current_period}</th>
                        <th>qty delta</th>
                        <th>${analytic_data.textes.prev_period}</th>
                        <th>${analytic_data.textes.current_period}</th>
                        <th>rev delta</th>
                    </tr>`
        table_value += '<tbody>'

        current.forEach(function(current_product) {
            let prev_product = prev.filter(p => {return p.name == current_product.name})[0]

            let prev_tons    = parseInt(prev_product.tons)
            let current_tons = parseInt(current_product.tons)
            let prev_cash    = parseInt(prev_product.cash)
            let current_cash = parseInt(current_product.cash)

            let tons_delta = 0
            if (prev_tons == 0 && current_tons == 0) {tons_delta = 0}
            else if (prev_tons == 0 && current_tons != 0) {tons_delta = 100}
            else {tons_delta = 100 * current_tons / prev_tons}

            let cash_delta = 0
            if (prev_cash == 0 && current_cash == 0) {cash_delta = 0}
            else if (prev_cash == 0 && current_cash != 0) {cash_delta = 100}
            else {cash_delta = 100 * current_cash / prev_cash}

            table_value += `
                    <tr class="spg_table_row" >
                        <td>${current_product.name}</td>
                        <td>${formatNum(prev_tons)}</td>
                        <td>${formatNum(current_tons)}</td>
                        <td>${parseInt(tons_delta)}%</td>
                        <td>${formatNum(prev_cash)}</td>
                        <td>${formatNum(current_cash)}</td>
                        <td>${parseInt(cash_delta)}%</td>
                    </tr> `
        });

        table_value += '</tbody>'
        const table = document.getElementById('table_buyer_analytic_overview')
        table.innerHTML = table_value
    }
    function showGraphMonthes(for_whom){
        for_whom = for_whom == "buyer" ? "buyer_" : ""

        let parent = document.getElementById(`div_${for_whom}graph_monthes`)

        let show_graph = true
        if (arraySum(analytic_data.prev_period.monthes_tons) == 0 && arraySum(analytic_data.prev_period.monthes_cash) == 0) {
            show_graph = false
        }

        if (show_graph){
            parent.querySelector(`.analytic_block[data-type="tons"] .graph_analytic_wrap`).classList.remove("hide")
            parent.querySelector(`.analytic_block[data-type="cash"] .graph_analytic_wrap`).classList.remove("hide")
            document.getElementById(`monthes_${for_whom}legend_weight`).classList.remove("hide")
            document.getElementById(`monthes_${for_whom}legend_money`) .classList.remove("hide")
        } else {
            parent.querySelector(`.analytic_block[data-type="tons"] .graph_analytic_wrap`).classList.add("hide")
            parent.querySelector(`.analytic_block[data-type="cash"] .graph_analytic_wrap`).classList.add("hide")
            document.getElementById(`monthes_${for_whom}legend_weight`).classList.add("hide")
            document.getElementById(`monthes_${for_whom}legend_money`) .classList.add("hide")
        }


        Array.from(parent.getElementsByClassName("analytics_no_data")).forEach(function(element) {
            element.style.display = show_graph ? "none" : "flex"
        })

        Array.from(parent.getElementsByClassName("container_action_btn")).forEach(function(element) {
            element.style.display =  show_graph ? "flex" : "none"
        })

        if (show_graph == false){
            return
        }

        const options = {

            responsive: true,
            scales: {
                x: {
                    stacked: true,
                    beginAtZero: true
                },
                y: {
                    type: 'linear'

                }
            },

            plugins: {
                title: {
                    display: false
                },
                tooltip: {
                    mode: 'point',
                    intersect: false
                },
                legend: {display: false},
            }
        }

        var ctx = document.getElementById(`graph_${for_whom}monthes_weight`).getContext('2d');
        // let gradient_weight_f1 = ctx.createLinearGradient(0, 220, 0, 0);
        //     gradient_weight_f1.addColorStop(0, window.chartColors.grad_start_tons_f1);
        //     gradient_weight_f1.addColorStop(1, window.chartColors.grad_end_tons_f1);
        let gradient_weight_p2 = ctx.createLinearGradient(0, 0, 0, 220);
        gradient_weight_p2.addColorStop(0, window.chartColors.grad_start_tons_p2);
        gradient_weight_p2.addColorStop(1, window.chartColors.grad_end_tons_p2);
        let gradient_weight_f2 = ctx.createLinearGradient(0, 0, 0, 220);
        gradient_weight_f2.addColorStop(0, window.chartColors.grad_start_tons_f2);
        gradient_weight_f2.addColorStop(1, window.chartColors.grad_end_tons_f2);
        // let gradient_weight_4 = ctx.createLinearGradient(90, 0, 90, 220);
        //     gradient_weight_4.addColorStop(0, window.chartColors.grad_start_monthes_weight_4);
        //     gradient_weight_4.addColorStop(1, window.chartColors.grad_end_monthes_weight_4);
        // let gradient_weight_5 = ctx.createLinearGradient(90, 0, 90, 220);
        //     gradient_weight_5.addColorStop(0, window.chartColors.grad_start_monthes_weight_5);
        //     gradient_weight_5.addColorStop(1, window.chartColors.grad_end_monthes_weight_5);
        const analytic_data_textes = [
            analytic_data.textes.prev_period,
            analytic_data.textes.raf,
            analytic_data.textes.current_period
        ];
        let labels_colors = [
            window.chartColors.grad_start_tons_f1,
            window.chartColors.grad_end_tons_p2,
            window.chartColors.grad_end_tons_f2
        ];

        let table_data = ``
        analytic_data_textes.forEach(function(element, i) {
            table_data += ` <div class="workspace_row">
                                    <div class="title">
                                        <div class="graph_legend" style="background-color: ${labels_colors[i]}"></div>
                                        ${element}
                                    </div>
                                </div>`
        });
        document.getElementById(`monthes_${for_whom}legend_weight`).innerHTML = table_data;

        const labels = analytic_data.textes.monthes;

        var monthes_weight_data = {
            labels: labels,
            datasets: [
                {
                    type: 'bar',
                    yAxisID: 'y',
                    label: analytic_data.textes.prev_period,
                    backgroundColor: labels_colors[0],
                    stack: 'Stack2',
                    data: analytic_data.prev_period.monthes_tons,
                    borderRadius: 3,
                    //data: [10, 50, 20, 70, 40, 10, 70, 20, 80, 30, 60, 70],
                },
                {
                    type: 'bar',
                    yAxisID: 'y',
                    label: analytic_data.textes.raf,
                    backgroundColor: gradient_weight_p2,
                    stack: 'Stack3',
                    data: analytic_data.raf.monthes_tons,
                    borderRadius: 3,
                },
                {
                    type: 'bar',
                    yAxisID: 'y',
                    label: analytic_data.textes.current_period,
                    backgroundColor: gradient_weight_f2,
                    stack: 'Stack4',
                    data: analytic_data.current_period.monthes_tons,
                    borderRadius: 3,
                }
            ]
        };

        if (graph_monthes_weight != null) graph_monthes_weight.destroy()
        graph_monthes_weight = new Chart(ctx, {
            type:    'bar',
            data:    monthes_weight_data,
            options: options
        });

        var ctx = document.getElementById(`graph_${for_whom}monthes_money`).getContext('2d');
        // let gradient_money_f1 = ctx.createLinearGradient(0, 220, 0, 0);
        //     gradient_money_f1.addColorStop(0, window.chartColors.grad_start_cash_f1);
        //     gradient_money_f1.addColorStop(1, window.chartColors.grad_end_cash_f1);
        let gradient_money_p2 = ctx.createLinearGradient(0, 0, 0, 220);
        gradient_money_p2.addColorStop(0, window.chartColors.grad_start_cash_p2);
        gradient_money_p2.addColorStop(1, window.chartColors.grad_end_cash_p2);
        let gradient_money_f2 = ctx.createLinearGradient(0, 0, 0, 220);
        gradient_money_f2.addColorStop(0, window.chartColors.grad_start_cash_f2);
        gradient_money_f2.addColorStop(1, window.chartColors.grad_end_cash_f2);
        // let gradient_monthes_money_4 = ctx.createLinearGradient(90, 0, 90, 220);
        //     gradient_monthes_money_4.addColorStop(0, window.chartColors.grad_start_monthes_money_4);
        //     gradient_monthes_money_4.addColorStop(1, window.chartColors.grad_end_monthes_money_4);
        // let gradient_monthes_money_5 = ctx.createLinearGradient(90, 0, 90, 220);
        //     gradient_monthes_money_5.addColorStop(0, window.chartColors.grad_start_monthes_money_5);
        //     gradient_monthes_money_5.addColorStop(1, window.chartColors.grad_end_monthes_money_5);

        labels_colors = [
            window.chartColors.grad_start_cash_f1,
            window.chartColors.grad_end_cash_p2,
            window.chartColors.grad_end_cash_f2
        ];

        table_data = ``;
        analytic_data_textes.forEach(function(element, i) {
            table_data += ` <div class="workspace_row">
                                    <div class="title">
                                        <div class="graph_legend" style="background-color: ${labels_colors[i]}"></div>
                                        ${element}
                                    </div>
                                </div>`
        });
        document.getElementById(`monthes_${for_whom}legend_money`).innerHTML = table_data;

        var monthes_money_data = {
            labels: labels,
            datasets: [
                {
                    type: 'bar',
                    yAxisID: 'y',
                    label: analytic_data.textes.prev_period,
                    backgroundColor: labels_colors[0],
                    stack: 'Stack 2',
                    data: analytic_data.prev_period.monthes_cash,
                    borderRadius: 3,
                    //data: [30, 40, 60, 80, 70, 50, 30, 40, 60, 80, 70, 50],
                },
                {
                    type: 'bar',
                    yAxisID: 'y',
                    label: analytic_data.textes.raf,
                    backgroundColor: gradient_money_p2,
                    stack: 'Stack 3',
                    data: analytic_data.raf.monthes_cash,
                    borderRadius: 3,
                    //data: [30, 40, 60, 80, 70, 50, 30, 40, 60, 80, 70, 50],


                },
                {
                    type: 'bar',
                    yAxisID: 'y',
                    label: analytic_data.textes.current_period,
                    backgroundColor: gradient_money_f2,
                    stack: 'Stack 4',
                    data: analytic_data.current_period.monthes_cash,
                    borderRadius: 3,
                    //data: [30, 40, 60, 80, 70, 50, 30, 40, 60, 80, 70, 50],


                }
            ]
        };

        if (graph_monthes_money != null) graph_monthes_money.destroy()
        graph_monthes_money = new Chart(ctx, {
            type:    'bar',
            data:    monthes_money_data,
            options: options
        });

    }

    function drawGraphPie(container_id, data_type){
        let data   = analytic_data.current_period[`${data_type}`]
        let container = document.getElementById(container_id)
        let clear_type = data_type.split("_")[data_type.split("_").length - 1]

        let pie    = container.querySelector(`.analytic_block[data-type="${clear_type}"] canvas`)
        let legend = container.querySelector(`.analytic_block[data-type="${clear_type}"] .workspace_table`)

        let no_data = container.querySelector(`.analytic_block[data-type="${clear_type}"] .analytics_no_data`)
        let graph_wrap = container.querySelector(`.analytic_block[data-type="${clear_type}"] .graph_analytic_wrap`)
        let btns = container.querySelector(`.container_action_btn`)


        if (arraySum(data) == 0) {
            graph_wrap.style.display  = 'none'
            legend.style.display  = 'none'
            btns.style.display  = 'none'
            no_data.style.display = 'flex'
        } else {
            graph_wrap.style.display  = 'flex'
            legend.style.display  = 'flex'
            btns.style.display  = 'flex'
            no_data.style.display = 'none'
        }

        let labels = analytic_data.current_period[`${data_type}_labels`]


        let graph_variable = `graph_${data_type}`

        drawGraphPieTable(container, clear_type, labels, data)

        let gradients = []
        let labels_colors = []

        var ctx = pie.getContext('2d');
        labels.forEach((item, i) => {
            let color_num = i > 6 ? i % 6 : i
            let gradient = ctx.createRadialGradient(150, 150, 0, 150, 150, 150);
            gradient.addColorStop(0, window.chartColors[`category_${color_num}_start`]);
            gradient.addColorStop(1, window.chartColors[`category_${color_num}_finish`]);
            gradients.push(gradient)
            labels_colors.push(window.chartColors[`category_${color_num}_finish`])
        })


        let table_data = ``
        let table_data_sum = 0

        if (data.every(element => element == 0)) {
            noDataGraph(data, pie, labels)
        } else {
            table_data = ``
            table_data_sum = 0
            data.forEach(function(element, i) {
                table_data_sum += Number(element)
            });
            data.forEach(function(element, i) {
                let int = parseInt(Number(element))
                let int_string = formatNum(int, true)

                table_data += ` <div class="workspace_row">
                                        <div class="title">
                                            <div class="graph_legend" style="background-color: ${labels_colors[i]}"></div>
                                            ${labels[i]}
                                        </div>
                                        <div>${int_string}</div>
                                        <div>${((int / table_data_sum) * 100).toFixed(1)}%</div>
                                    </div>`
            });
            table_data += `<div class="workspace_row" >
                                    <div class="title">Total</div>
                                    <div>${parseInt(table_data_sum)}</div>
                                    <div></div>
                                </div>`

            legend.innerHTML = table_data




            if (window.chartColors[`${graph_variable}`] != null) window.chartColors[`${graph_variable}`].destroy()

            window.chartColors[`${graph_variable}`] = new Chart(ctx, {
                type:    'pie',
                data: { datasets: [{label: '',
                        backgroundColor: gradients,
                        data: data,
                        rotation: -70,
                    }]
                },
                options: {
                    plugins: {
                        title: {
                            display: false
                        },
                        tooltip: {
                            mode: 'point',
                            intersect: false
                        },
                    },
                    borderWidth: 0,
                    responsive: true,
                }
            });
        }


    }
    function drawGraphPieTable(parent, type, labels, data){
        let thead = `<tr>
                         <th></th>
                         <th>${analytic_data.textes.current_period}</th>
                         <th>%</th>
                     </tr>`


        let sum = 0
        data.forEach(function(element, i) {
            sum += Number(element)
        });
        let tbody = '<tbody>'
        labels.forEach(function(item, i) {
            let int = parseInt(Number(data[i]))
            let int_string = formatNum(int, true)

            tbody += `<tr class="spg_table_row">
                          <td>${item}</td>
                          <td>${int_string}</td>
                          <td>${((int / sum) * 100).toFixed(1)}%</td>
                      </tr>`
        })
        tbody += '</tbody>'

        parent.querySelector(`.analytic_data_table[data-type="${type}"]`).innerHTML =  thead + tbody
    }

    document.getElementById('btn_buyer_analytic_overview').onclick = function(){
        let text = ''
        let visible = ''
        if (this.innerText == "HIDE") {
            text = "SHOW MORE"
            visible = 'none'
        } else {
            text = "HIDE"
            visible = 'block'
        }

        this.innerText   = text
        document.getElementById('div_buyer_analytic_tables').style.display   = visible
    }


    function showManufacturerAnalytic() {

        Array.from(document.getElementsByClassName("table_data ")).forEach(function(element) {
            element.style.display =  'none'
        });



        showBusinessOverview("manufacturer")
        showAnalyticCompanies()
        //showGraphForecast()
        showGraphMonthes()

        showGraphAveragePrice()
        showGraphPriceVsVolume()


        // ИНДУСТРИИ
        drawGraphPie('div_graph_industries', "industry_tons")
        drawGraphPie('div_graph_industries', "industry_cash")

        // РЕГИОНЫ
        let div_display = 'none'
        if (analytic_data.current_period.regions_tons_labels.length > 0){
            div_display = 'block'
            showGraphRegions()
        }
        document.querySelector("#div_graph_regions").style.display = div_display

        // КАТЕГОРИЯ 1
        div_display = 'none'
        if (analytic_data.current_period.category_1_tons_labels.length > 0){
            div_display = 'flex'
            document.querySelector("#div_graph_category_1 .analytic_header_main").innerText = analytic_data.current_period.category_1_name
            drawGraphPie('div_graph_category_1', "category_1_tons")
            drawGraphPie('div_graph_category_1', "category_1_cash")
        }
        document.querySelector("#div_graph_category_1").style.display = div_display


        // КАТЕГОРИЯ 2
        div_display = 'none'
        if (analytic_data.current_period.category_2_tons_labels.length > 0){
            div_display = 'flex'
            document.querySelector("#div_graph_category_2 .analytic_header_main").innerText = analytic_data.current_period.category_2_name
            drawGraphPie('div_graph_category_2', "category_2_tons")
            drawGraphPie('div_graph_category_2', "category_2_cash")
        }
        document.querySelector("#div_graph_category_2").style.display = div_display


        // КАТЕГОРИЯ 3
        div_display = 'none'
        if (analytic_data.current_period.category_3_tons_labels.length > 0){
            div_display = 'flex'
            document.querySelector("#div_graph_category_3 .analytic_header_main").innerText = analytic_data.current_period.category_3_name
            drawGraphPie('div_graph_category_3', "category_3_tons")
            drawGraphPie('div_graph_category_3', "category_3_cash")
        }
        document.querySelector("#div_graph_category_3").style.display = div_display


        // showGraphMaterials()


        // showAnalyticProducts()
        //
    }
    function showAnalyticCompanies(){
        let dataset =  []

        dataset = analytic_data.clients_table



        let table_value = `
                    <tr>
                        <th></th>
                        <th colspan="3" style="text-align: center">KG</th>
                        <th colspan="3" style="text-align: center">USD</th>
                    </tr> `
        table_value += `
                    <tr>
                        <th></th>
                        <th>${analytic_data.textes.prev_period}</th>
                        <th>${analytic_data.textes.current_period}</th>
                        <th>qty delta</th>
                        <th>${analytic_data.textes.prev_period}</th>
                        <th>${analytic_data.textes.current_period}</th>
                        <th>rev delta</th>
                    </tr>`

        table_value += '<tbody>'
        let items_count = 0
        dataset.forEach(function(element) {
            if (parseInt(element.tons_prev) == 0 && parseInt(element.tons_current) == 0 && parseInt(element.cash_prev) == 0 && parseInt(element.cash_current) == 0) {
                return
            }

            let row_style = `type_${element.type}`
            table_value += `
                    <tr class="spg_table_row  ${row_style} "
                        data-name="${element.name}">
                        <td>${element.name}</td>
                        <td>${formatNum(parseInt(element.tons_prev))}</td>
                        <td>${formatNum(parseInt(element.tons_current))}</td>
                        <td>${parseInt(element.tons_delta)}%</td>
                        <td>${formatNum(parseInt(element.cash_prev))}</td>
                        <td>${formatNum(parseInt(element.cash_current))}</td>
                        <td>${parseInt(element.cash_delta)}%</td>
                    </tr> `
        });


        table_value += '</tbody>'
        const table = document.getElementById('table_analytic_overview')
        table.innerHTML = table_value
        Array.from(table.querySelectorAll(".type_company")).forEach(function(element) {
            element.addEventListener('click', showAnalyticCompany  );
        });
    }
    function showAnalyticCompany(){
        console.log("showAnalyticCompany", this.getAttribute("data-name"))

        let data = [
            {name: 'OM-01T', qty: '10000 kg', revenu: '100000$', av_price: '10$' },
            {name: 'LSY-01', qty: '5000 kg', revenu: '50000$', av_price: '10$' },
            {name: 'JC-04T', qty: '1000 kg', revenu: '10000$', av_price: '10$' },
            {name: 'Gellan Gum', qty: '4000 kg', revenu: '40000$', av_price: '10$' },
            {name: ' ', qty: '', revenu: '', av_price: '' },
            {name: ' ', qty: '', revenu: '', av_price: '' },
            {name: 'Итого', qty: '100.000 kg', revenu: '1.000.000 $', av_price: '' }
        ]



        sendRequest('post', 'get_company_products', {company_name: this.getAttribute("data-name"), filters: analytic_filter})
            .then(data => {

                let row_html = ''
                row_html = `
                    <thead>
                        <tr>
                                 <th>Product</th>
                                 <th>Revenu, USD</th>
                                 <th>Volume, KG</th>
                                 <th>Average Price, $</th>
                        </tr>
                    </thead>`
                data.products.forEach(function(element) {
                    row_html += `<tr class="spg_table_row">
                                     <td>${element.name}</td>
                                     <td>${formatNum(parseInt(element.cash))}</td>
                                     <td>${formatNum(parseInt(element.tons))}</td>
                                     <td>${parseFloat(element.av_price).toFixed(2)}</td>
                                 </tr>`
                });

                document.getElementById('analytic_table_company').innerHTML = row_html
                showPopup("analytic_company")
            })
            .catch(err => console.log(err))
    }
    document.getElementById('btn_download_company_products').onclick = function() {
        const table = document.getElementById('analytic_table_company')
        downloadTableAsCSV(table)
    }
    function showGraphRegions(){
        const options = {
            type: "bar",
            plugins: {
                title: {
                    display: false
                },
                tooltip: {
                    mode: 'point',
                    intersect: false
                },
                legend: {display: false},
            },
            responsive: true,
            scales: {
                x: {
                    stacked: true,
                    beginAtZero: true
                },
                y: {
                    type: 'linear',
                    beginAtZero: true
                },
            },
        }


        var ctx = document.getElementById('graph_regions_weight').getContext('2d');
        // let gradient_weight_f1 = ctx.createLinearGradient(0, 220, 0, 0);
        //     gradient_weight_f1.addColorStop(0, window.chartColors.grad_start_tons_f1);
        //     gradient_weight_f1.addColorStop(1, window.chartColors.grad_end_tons_f1);
        let gradient_weight_p2 = ctx.createLinearGradient(0, 0, 0, 220);
        gradient_weight_p2.addColorStop(0, window.chartColors.grad_start_tons_p2);
        gradient_weight_p2.addColorStop(1, window.chartColors.grad_end_tons_p2);
        let gradient_weight_f2 = ctx.createLinearGradient(0, 0, 0, 220);
        gradient_weight_f2.addColorStop(0, window.chartColors.grad_start_tons_f2);
        gradient_weight_f2.addColorStop(1, window.chartColors.grad_end_tons_f2);

        const analytic_data_textes = [
            analytic_data.textes.prev_period,
            analytic_data.textes.raf,
            analytic_data.textes.current_period
        ];
        let labels_colors = [
            window.chartColors.grad_start_tons_f1,
            window.chartColors.grad_end_tons_p2,
            window.chartColors.grad_end_tons_f2
        ];

        let table_data = ``
        analytic_data_textes.forEach(function(element, i) {
            table_data += ` <div class="workspace_row">
                                        <div class="title">
                                            <div class="graph_legend" style="background-color: ${labels_colors[i]}"></div>
                                            ${element}
                                        </div>
                                    </div>`
        });
        document.getElementById('regions_legend_weight').innerHTML = table_data;

        const labels = analytic_data.current_period.regions_tons_labels
        let raf_tons = []
        let raf_cash = []
        labels.forEach(function(element, i) {
            const code = element
            raf_tons.push(analytic_data.raf.regions_tons[`${code}`])
            raf_cash.push(analytic_data.raf.regions_cash[`${code}`])
        });

        let weight_data = {
            labels: labels,
            datasets: [
                {
                    type: 'bar',
                    label: analytic_data.textes.prev_period,
                    backgroundColor: labels_colors[0],
                    //   data: [50, 75, 95, 120, 80],
                    data:    analytic_data.prev_period.regions_tons,
                    stack: 'Stack 0',
                    yAxisID: 'y',
                    borderRadius: 3,
                },
                {
                    type: 'bar',
                    label: analytic_data.textes.raf,
                    backgroundColor: gradient_weight_p2,
                    //data: [40, 85, 75, 130, 90],
                    data:  raf_tons,
                    stack: 'Stack 1',
                    yAxisID: 'y',
                    borderRadius: 3,
                },
                {
                    type: 'bar',
                    label: analytic_data.textes.current_period,
                    backgroundColor: gradient_weight_f2,
                    //data: [80, 65, 60, 100, 70],
                    data:   analytic_data.current_period.regions_tons,
                    stack: 'Stack 2',
                    yAxisID: 'y',
                    borderRadius: 3,
                }
            ]
        };
        if (graph_regions_weight != null) graph_regions_weight.destroy()
        graph_regions_weight = new Chart(ctx, {
            type: 'bar',
            data: weight_data,
            options: options
        });

        var ctx = document.getElementById('graph_regions_money').getContext('2d');
        // let gradient_money_f1 = ctx.createLinearGradient(0, 220, 0, 0);
        //     gradient_money_f1.addColorStop(0, window.chartColors.grad_start_cash_f1);
        //     gradient_money_f1.addColorStop(1, window.chartColors.grad_end_cash_f1);
        let gradient_money_p2 = ctx.createLinearGradient(0, 0, 0, 220);
        gradient_money_p2.addColorStop(0, window.chartColors.grad_start_cash_p2);
        gradient_money_p2.addColorStop(1, window.chartColors.grad_end_cash_p2);
        let gradient_money_f2 = ctx.createLinearGradient(0, 0, 0, 220);
        gradient_money_f2.addColorStop(0, window.chartColors.grad_start_cash_f2);
        gradient_money_f2.addColorStop(1, window.chartColors.grad_end_cash_f2);

        labels_colors = [
            window.chartColors.grad_start_cash_f1,
            window.chartColors.grad_end_cash_p2,
            window.chartColors.grad_end_cash_f2
        ];

        table_data = ``
        analytic_data_textes.forEach(function(element, i) {
            table_data += ` <div class="workspace_row">
                                        <div class="title">
                                            <div class="graph_legend" style="background-color: ${labels_colors[i]}"></div>
                                            ${element}
                                        </div>
                                    </div>`
        });
        document.getElementById('regions_legend_money').innerHTML = table_data;


        let money_data = {
            labels: labels,
            datasets: [
                {
                    type: 'bar',
                    label: analytic_data.textes.prev_period,
                    backgroundColor: labels_colors[0],
                    //data:  [50, 75, 95, 120, 80],
                    data:    analytic_data.prev_period.regions_cash,
                    stack: 'Stack 0',
                    yAxisID: 'y',
                    borderRadius: 3,
                },
                {
                    type: 'bar',
                    label: analytic_data.textes.raf,
                    backgroundColor: gradient_money_p2,
                    //data: [40, 85, 65, 100, 70],
                    data:  raf_cash,
                    stack: 'Stack 1',
                    yAxisID: 'y',
                    borderRadius: 3,
                },
                {
                    type: 'bar',
                    label: analytic_data.textes.current_period,
                    backgroundColor: gradient_money_f2,
                    //data:  [60, 65, 105, 90, 60],
                    data:  analytic_data.current_period.regions_cash,
                    stack: 'Stack 2',
                    yAxisID: 'y',
                    borderRadius: 3,
                }
            ]
        };
        if (graph_regions_money != null) graph_regions_money.destroy()
        graph_regions_money = new Chart(ctx, {
            type: 'bar',
            data: money_data,
            options: options
        });

    }
    function showTableRegions(tons_table, cash_table){
        let thead = `<tr>
                         <th></th>
                         <th>${analytic_data.textes.prev_period}</th>
                         <th>${analytic_data.textes.current_vs_prev}</th>
                         <th>${analytic_data.textes.current_period}</th>
                     </tr>`

        let labels = analytic_data.current_period.regions_tons_labels
        let tbody = '<tbody>'
        labels.forEach(function(item, i) {
            let compare = analytic_data.compare_data.regions_tons[i] == null ? 0 : analytic_data.compare_data.regions_tons[i]
            let prev = formatNum(parseInt(analytic_data.prev_period.regions_tons[i]))
            let current = formatNum(parseInt(analytic_data.current_period.regions_tons[i]))

            tbody += `<tr class="spg_table_row">
                          <td>${item}</td>
                          <td>${prev}</td>
                          <td>${parseInt(compare)}%</td>
                          <td>${current}</td>
                      </tr>`
        })
        tbody += '</tbody>'
        tons_table.innerHTML =  thead
        tons_table.innerHTML += tbody


        labels = analytic_data.current_period.regions_cash_labels
        tbody = '<tbody>'
        labels.forEach(function(item, i) {
            let compare = analytic_data.compare_data.regions_cash[i] == null ? 0 : analytic_data.compare_data.regions_cash[i]
            let prev = formatNum(parseInt(analytic_data.prev_period.regions_cash[i]))
            let current = formatNum(parseInt(analytic_data.current_period.regions_cash[i]))

            tbody += `<tr class="spg_table_row">
                          <td>${item}</td>
                          <td>${prev}</td>
                          <td>${parseInt(compare)}%</td>
                          <td>${current}</td>
                      </tr>`
        })
        tbody += '</tbody>'
        cash_table.innerHTML =  thead
        cash_table.innerHTML += tbody
    }
    function showGraphAveragePrice(){
        let labels = analytic_data.current_period.category_2_tons_labels

        var ctx = document.getElementById('graph_average_price_category').getContext('2d');
        // let gradient_money_f1 = ctx.createLinearGradient(0, 220, 0, 0);
        //     gradient_money_f1.addColorStop(0, window.chartColors.grad_start_cash_f1);
        //     gradient_money_f1.addColorStop(1, window.chartColors.grad_end_cash_f1);
        let gradient_money_f2 = ctx.createLinearGradient(0, 0, 0, 220);
        gradient_money_f2.addColorStop(0, window.chartColors.grad_start_cash_f2);
        gradient_money_f2.addColorStop(1, window.chartColors.grad_end_cash_f2);

        const price_data_textes = [
            `Price ${analytic_data.textes.prev}`,
            `Price ${analytic_data.textes.current}`
        ]
        let labels_colors = [
            window.chartColors.grad_start_cash_f1,
            window.chartColors.grad_end_cash_f2
        ];

        var config = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: `Price ${analytic_data.textes.prev}`,
                    backgroundColor: labels_colors[0],
                    borderColor: labels_colors[0],
                    //data: [50, 70, 40, 60, 90, 80],
                    data:  analytic_data.prev_period.category_1_prices,
                    stack: 'Stack 0',
                    borderRadius: 3,
                }, {
                    label: `Price ${analytic_data.textes.current}`,
                    backgroundColor: gradient_money_f2,
                    borderColor: gradient_money_f2,
                    //data: [60, 50, 80, 50, 100, 40],
                    data:  analytic_data.current_period.category_1_prices,
                    stack: 'Stack 1',
                    borderRadius: 3,
                }]
            },
            options: {
                responsive: true,
                // maintainAspectRatio: false,
                hover: {
                    mode: 'point',
                    intersect: true
                },

                scales: {
                    x: {
                        stacked: true,
                        beginAtZero: true
                    },
                    y: {
                        display: true,
                        beginAtZero: true
                    }
                },
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    },
                    legend: {display: false}

                }
            }
        };


        let table_data = ``
        price_data_textes.forEach(function(element, i) {
            table_data += ` <div class="workspace_row">
                                    <div class="title">
                                        <div class="graph_legend" style="background-color: ${labels_colors[i]}"></div>
                                        ${element}
                                    </div>
                                </div>`
        });
        document.getElementById('monthes_legend_price_category').innerHTML = table_data;

        if (graph_average_price_category != null) graph_average_price_category.destroy()
        graph_average_price_category = new Chart(ctx, config);


    }
    function showGraphPriceVsVolume(){

        var ctx = document.getElementById('graph_average_price_vs_volume_monthes').getContext('2d');
        let gradient_money_f1 = ctx.createLinearGradient(400, 0, 0, 0);
        gradient_money_f1.addColorStop(0, window.chartColors.grad_start_cash_f1);
        gradient_money_f1.addColorStop(1, window.chartColors.grad_end_cash_f1);
        let gradient_money_f2 = ctx.createLinearGradient(400, 0, 0, 0);
        gradient_money_f2.addColorStop(0, window.chartColors.grad_end_cash_f2);
        gradient_money_f2.addColorStop(1, window.chartColors.grad_end_cash_f2);
        let gradient_weight_f2 = ctx.createLinearGradient(0, 0, 0, 220);
        gradient_weight_f2.addColorStop(0, window.chartColors.grad_start_tons_f2);
        gradient_weight_f2.addColorStop(1, window.chartColors.grad_end_tons_f2);

        let labels = analytic_data.textes.monthes
        var config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        type: 'line',
                        yAxisID: 'y2',
                        label: `Price ${analytic_data.textes.prev}`,
                        backgroundColor: gradient_money_f1,
                        borderColor:     gradient_money_f1,
                        data:  analytic_data.prev_period.prices_month_value,
                        fill: false,
                        borderRadius: 3,
                    }
                    ,
                    {
                        type: 'line',
                        yAxisID: 'y2',
                        label: `Price ${analytic_data.textes.current}`,
                        backgroundColor: gradient_money_f2,
                        borderColor:     gradient_money_f2,

                        data:  analytic_data.current_period.prices_month_value,
                        fill: false,
                        borderRadius: 3,
                    }
                    , {
                        type: 'bar',
                        yAxisID: 'y',
                        label: `Volume ${analytic_data.textes.current}`,
                        fill: false,
                        backgroundColor: gradient_weight_f2,
                        // borderColor: window.chartColors.blue,
                        data: analytic_data.current_period.monthes_tons,
                        borderRadius: 3,
                    }]
            },
            options: {

                hover: {
                    mode: 'point',
                    intersect: true
                },

                scales: {
                    y: {
                        type: 'linear',
                        beginAtZero: true
                    },
                    y2: {

                        type: 'linear',
                        position: 'right',
                        grid: {
                            drawOnChartArea: false, // only want the grid lines for one axis to show up
                        },
                        beginAtZero: true
                    }
                },
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    },

                    legend: {display: false}
                }
            }
        };
        // const price_data_textes = [
        //     analytic_data.textes.prev_period,
        //     analytic_data.textes.current_period
        // ];
        let labels_colors = [
            window.chartColors.grad_start_cash_f1,
            window.chartColors.grad_end_cash_f2,
            window.chartColors.grad_end_tons_f2,
        ];

        let table_data = ``
        config.data.datasets.forEach(function(element, i) {
            table_data += ` <div class="workspace_row">
                                    <div class="title">
                                        <div class="graph_legend" style="background-color: ${labels_colors[i]}"></div>
                                        ${element.label}
                                    </div>
                                </div>`
        });
        document.getElementById('monthes_legend_price_volume').innerHTML = table_data;



        if (graph_average_price_vs_volume_monthes != null) graph_average_price_vs_volume_monthes.destroy()
        graph_average_price_vs_volume_monthes = new Chart(ctx, config);


    }
    Array.from(document.querySelectorAll("[data-listener=btn_analytic_show_data]")).forEach(function(element) {
        element.addEventListener('click', analyticShowData)
    });
    function analyticShowData(){
        //this.parentElement.style.display = 'none'

        let text = ''
        let visible = ''
        if (this.innerText == "HIDE") {
            text = "SHOW MORE"
            visible = 'none'
        } else {
            text = "HIDE"
            visible = 'flex'
        }

        this.innerText   = text

        const parent = this.parentElement.parentElement
        const tons_table = parent.querySelectorAll(".spg_table[data-type=tons]")[0]
        const cash_table = parent.querySelectorAll(".spg_table[data-type=cash]")[0]
        const tables_div = parent.querySelectorAll(".table_data")[0]
        tables_div.style.display = visible

        switch (this.getAttribute("data-type")) {
            case 'regions':
                showTableRegions(tons_table, cash_table)
                break;
            case 'monthes':
                showTableMonthes(tons_table, cash_table)
                break;

        }
    }
    function showTableMonthes(tons_table, cash_table){
        let thead = `<tr>
                         <th></th>
                         <th>${analytic_data.textes.prev_period}</th>
                         <th>${analytic_data.textes.current_vs_prev}</th>
                         <th>${analytic_data.textes.current_period}</th>
                     </tr>`

        let labels =  analytic_data.textes.monthes
        let tbody = '<tbody>'
        labels.forEach(function(item, i) {
            let compare = analytic_data.compare_data.monthes_years_tons[i] == null ? '-' : analytic_data.compare_data.monthes_years_tons[i]
            let prev = formatNum(parseInt(analytic_data.prev_period.monthes_tons[i]))
            let current = formatNum(parseInt(analytic_data.current_period.monthes_tons[i]))
            tbody += `<tr class="spg_table_row">
                          <td>${item}</td>
                          <td>${prev}</td>
                          <td>${parseInt(compare)}%</td>
                          <td>${current}</td>
                      </tr>`
        })
        tbody += '</tbody>'
        tons_table.innerHTML =  thead
        tons_table.innerHTML += tbody


        labels = analytic_data.textes.monthes
        tbody = '<tbody>'
        labels.forEach(function(item, i) {
            let compare = analytic_data.compare_data.monthes_years_cash[i] == null ? 0 : analytic_data.compare_data.monthes_years_cash[i]
            let prev = formatNum(parseInt(analytic_data.prev_period.monthes_cash[i]))
            let current = formatNum(parseInt(analytic_data.current_period.monthes_cash[i]))

            tbody += `<tr class="spg_table_row">
                          <td>${item}</td>
                          <td>${prev}</td>
                          <td>${parseInt(compare)}%</td>
                          <td>${current}</td>
                      </tr>`
        })
        tbody += '</tbody>'
        cash_table.innerHTML =  thead
        cash_table.innerHTML += tbody
    }
    document.getElementById('btn_overview_details').onclick = function(){
        let text = ''
        let visible = ''
        if (this.innerText == "HIDE") {
            text = "SHOW MORE"
            visible = 'none'
        } else {
            text = "HIDE"
            visible = 'block'
        }

        this.innerText   = text
        document.getElementById('div_analytic_tables').style.display   = visible
    }
    document.getElementById('btn_download_overview_table').onclick = function(){
        downloadTableAsCSV(document.getElementById('table_analytic_overview'))
    }
    document.getElementById('btn_analytic_prices_details').onclick = function(){
        const parent = this.parentElement.parentElement
        const tables_div = parent.querySelectorAll(".table_data")[0]

        let text = ''
        let visible = ''
        if (this.innerText == "HIDE") {
            text = "SHOW MORE"
            visible = 'none'
        } else {
            text = "HIDE"
            visible = 'flex'
        }

        this.innerText   = text
        tables_div.style.display   = visible


        const volume_table   = parent.querySelectorAll(".spg_table[data-type=tons]")[0]
        const category_table = parent.querySelectorAll(".spg_table[data-type=cash]")[0]

        showTablePriceVolume(volume_table)
        showTablePriceCategory(category_table)
    }
    function showTablePriceVolume(table){
        let thead = `<tr>
                         <th></th>
                         <th>Price ${analytic_data.textes.prev}</th>
                         <th>Price ${analytic_data.textes.current}</th>
                         <th>Volume ${analytic_data.textes.current}</th>
                     </tr>`

        let labels = analytic_data.textes.monthes
        let tbody = '<tbody>'
        labels.forEach(function(item, i) {
            let price_prev = analytic_data.prev_period.prices_month_value[i]
            if (price_prev == null) { price_prev = '-' }

            let price_current = analytic_data.current_period.prices_month_value[i]
            if (price_current == null) { price_current = '-' }

            let tons = analytic_data.current_period.monthes_tons[i]
            if (tons == null) { tons = 0 }


            tbody += `<tr class="spg_table_row">
                          <td>${item}</td>
                          <td>${price_prev}</td>
                          <td>${price_current}</td>
                          <td>${tons}</td>
                      </tr>`
        })
        tbody += '</tbody>'
        table.innerHTML =  thead
        table.innerHTML += tbody
    }
    function showTablePriceCategory(table){
        let thead = `<tr>
                         <th></th>
                         <th>Price ${analytic_data.textes.prev}</th>
                         <th>Price ${analytic_data.textes.current}</th>
                     </tr>`

        let labels = analytic_data.current_period.category_2_tons_labels
        let tbody = '<tbody>'
        labels.forEach(function(item, i) {
            tbody += `<tr class="spg_table_row">
                          <td>${item}</td>
                          <td>${analytic_data.prev_period.category_1_prices[i]}</td>
                          <td>${analytic_data.current_period.category_1_prices[i]}</td>
                      </tr>`
        })
        tbody += '</tbody>'
        table.innerHTML =  thead
        table.innerHTML += tbody
    }

    Array.from(document.getElementsByClassName("download_table")).forEach(function(element) {
        element.addEventListener('click', downloadTable)
    });
    function downloadTable(){
        let parent = this.parentElement.parentElement
        const table = parent.getElementsByClassName('spg_table')[0]
        downloadTableAsCSV(table)
    }
    function downloadTableAsCSV(table, separator = ';') {
        // Select rows from table_id
        var rows = table.querySelectorAll('tr');
        // Construct csv
        var csv = [];
        for (var i = 0; i < rows.length; i++) {
            var row = [], cols = rows[i].querySelectorAll('td, th');
            for (var j = 0; j < cols.length; j++) {
                // Clean innertext to remove multiple spaces and jumpline (break csv)

                if (cols[j].style.display != 'none') {
                    let data = ''
                    if (cols[j].querySelectorAll('input').length > 0) {
                        console.log("cols[j].firstChild ", cols[j].querySelectorAll('input'))
                        console.log("cols[j].firstChild value ", cols[j].querySelectorAll('input')[0].value)
                        data = cols[j].querySelectorAll('input')[0].value
                    } else {
                        data = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, '').replace(/(\s\s)/gm, ' ')
                    }
                    data = data.replace(/"/g, '""');
                    data = data.replace('.', ',');
                    data = data.replace('NULL', '');
                    // Push escaped string
                    row.push('"' + data + '"');
                }

            }
            csv.push(row.join(separator));
        }
        var csv_string = `sep=;\n${csv.join('\n')}` ;
        // Download it
        var filename = 'export_' + new Date().toLocaleDateString() + '.csv';
        var link = document.createElement('a');
        link.style.display = 'none';
        link.setAttribute('target', '_blank');
        link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv_string));
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    Array.from(document.getElementsByClassName("download_graph")).forEach(function(element) {
        element.addEventListener('click', downloadGraph)
    });
    function downloadGraph(){
        let parent = this.parentElement.parentElement.parentElement.parentElement
        const downloaded_div = parent.querySelector(`.analytic_block[data-type=${this.getAttribute('data-type')}]`)

        const current_scroll = (window.pageYOffset || document.scrollTop)  - (document.clientTop || 0);
        downloaded_div.parentNode.style.overflow = 'visible';
        window.scrollTo(0,0)
        html2canvas(downloaded_div, {backgroundColor: '#191c24', scale: 4}).then(function(canvas) {
            let link = document.createElement('a');
            link.download = 'graph.png';
            link.href = canvas.toDataURL("image/png")
            link.click();
            window.scrollTo(0,current_scroll)
        });
    }

    document.getElementById('btn_download_analytic_full').onclick = function(){
        const downloaded_div = document.getElementById('page_manufacturer_analytics')
        const current_scroll = (window.pageYOffset || document.scrollTop)  - (document.clientTop || 0);
        downloaded_div.parentNode.style.overflow = 'visible';
        window.scrollTo(0,0)

        document.getElementById('btn_download_analytic_full').style.display = 'none'
        document.getElementById('btn_download_overview_table').style.display = 'none'
        Array.from(document.getElementsByClassName("drop__content")).forEach(function(element) {
            element.style.display = 'none'
        })
        Array.from(document.getElementsByClassName("download_graph")).forEach(function(element) {
            element.style.display = 'none'
        })
        Array.from(document.getElementsByClassName("download_table")).forEach(function(element) {
            element.style.display = 'none'
        })
        Array.from(document.getElementsByClassName("container_action_btn")).forEach(function(element) {
            element.style.display = 'none'
        })


        html2canvas(downloaded_div, {backgroundColor: '#121419'}).then(function(canvas) {
            let link = document.createElement('a');
            link.download = 'graph.png';
            link.href = canvas.toDataURL("image/png")
            link.click();
            window.scrollTo(0,current_scroll)



            document.getElementById('btn_download_analytic_full').style.display = 'block'
            document.getElementById('div_analytic_tables').style.display = 'none'
            document.getElementById('btn_download_overview_table').style.display = 'block'


            Array.from(document.getElementsByClassName("drop__content")).forEach(function(element) {
                element.style.display = 'block'
            })

            Array.from(document.getElementsByClassName("download_graph")).forEach(function(element) {
                element.style.display = 'block'
            })
            Array.from(document.getElementsByClassName("download_table")).forEach(function(element) {
                element.style.display = 'block'
            })
            Array.from(document.getElementsByClassName("container_action_btn")).forEach(function(element) {
                element.style.display = 'flex'
            })
            Array.from(document.getElementsByClassName("table_data")).forEach(function(element) {
                element.style.display = 'none'
            })
        });
    }

    ///// - MANAGE ANALYTICS ////










    ///// + MANAGE FILES ////
    Array.from(document.getElementsByClassName("certificate")).forEach(function(element) {
        element.addEventListener('click', downloadCertificate );
    })
    Array.from(document.getElementsByClassName("download_file")).forEach(function(element) {
        element.addEventListener('click', downloadCertificate );
    })
    function downloadCertificate(){
        window.open(this.getAttribute("data-link"), '_blank').focus()
    }


    document.getElementById('btn_download_pdf').onclick = function() {
        fetch(
            `${api_url}download_product_pdf`,
            { method: 'post',
                body: JSON.stringify({doc: 1}),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                document.getElementById('link_download_pdf').href = json.pdf_result
                document.getElementById('link_download_pdf').click()
            })
            .catch( error => console.error('error:', error) );
    }


    ///// - MANAGE FILES ////










    ///// + MANAGE PROFILE ////

    let profile_phone = null
    Array.from(document.querySelectorAll(".btns_edit_user")).forEach(function(element) {
        element.addEventListener('click', () => {
            showPopup("edit_profile")
            document.getElementById('edit_profile_avatar').setAttribute("src", main_data.user.avatar)
            document.getElementById('profile_firstname').value = main_data.user.name
            document.getElementById('profile_surname')  .value = main_data.user.surname
            document.getElementById('profile_email')    .value = main_data.user.email
            document.getElementById("profile_alert").style.display = 'none'

            const input = document.querySelector("#profile_phone");
            profile_phone = window.intlTelInput(input, {
                // any initialisation options go here
                autoHideDialCode: false,
                separateDialCode: true,
                utilsScript: "../libs/input_phone/utils.js",
            });
            profile_phone.setNumber(`+${main_data.user.phone}`)

        } );
    })
    document.getElementById('profile_email').addEventListener('input', function(){
        let text = 'Are you sure about changing email?<br>This may affect two-factor authentication.'
        document.getElementById("profile_alert").innerHTML = text
        document.getElementById("profile_alert").style.display = 'block'
    })
    document.getElementById('profile_phone').addEventListener('input', function(){
        let text = 'Are you sure about changing phone?<br>This may affect two-factor authentication.'
        document.getElementById("profile_alert").innerHTML = text
        document.getElementById("profile_alert").style.display = 'block'
    })

    document.getElementById('btn_update_profile').addEventListener('click', function(){
        console.log("isValid ", profile_phone.isValidNumber())
        console.log("getNumber ", profile_phone.getNumber())
        console.log("getSelectedCountryData ", profile_phone.getSelectedCountryData())
        console.log("dialCode ", profile_phone.getSelectedCountryData().dialCode)
        if (!profile_phone.isValidNumber()) {
            showAlert("Invalid phone number format")
            return
        }

        let name = document.getElementById('profile_firstname').value
        let surname = document.getElementById('profile_surname')  .value
        let email = document.getElementById('profile_email')    .value

        if (name == "" || surname == "" || email == ""){
            showAlert("Fill in all fields")
            return
        }

        sendRequest('post', 'update_profile', {
            name: name,
            surname: surname,
            email: email,
            phone_full: profile_phone.getNumber(),
            phone_country: profile_phone.getSelectedCountryData().dialCode
        })
            .then(data => {
                showNotify("Saved")
                main_data.user = data.user
                setUserInfo(data.user)
                closePopup()
            })
            .catch(err => console.log(err))

    })

    document.getElementById('edit_profile_avatar').addEventListener('click', function(){
        document.getElementById('input_profile_avatar').click()
    })
    document.getElementById('input_profile_avatar').onchange = function(){

        const formData = new FormData();
        const file_name = this.files[0].name
        const file_value = document.getElementById('input_profile_avatar');
        console.log("supply_set_document change ", file_name)
        formData.append('file_name', file_name);
        formData.append('token',     cookie_token)
        formData.append('file', file_value.files[0]);

        if (file_value.files.length == 0) {
            showAlert("Select file")
            return;
        }

        fetch(api_url + 'update_user_avatar', {
            method: 'PUT',
            body: formData
        })
            .then((response) => response.json())
            .then((data) => {
                main_data.user = data.user
                showNotify("Avatar updated")
                document.getElementById('edit_profile_avatar').setAttribute("src", data.user.avatar)

                Array.from(document.getElementsByClassName("avatar")).forEach(function(element) {
                    element.setAttribute("src", data.user.avatar)
                });

            })
            .catch((error) => {
                console.error('Error:', error);
            });

    }



    document.getElementById('div_manufacturer_logo').onclick = function() {
        document.getElementById('input_manufacturer_logo').click()
    }
    document.getElementById('input_manufacturer_logo').onchange = function() {
        const formData = new FormData();
        const file_name = this.files[0].name
        const file_value = document.getElementById('input_manufacturer_logo')
        formData.append('file_name', file_name);
        formData.append('token',     cookie_token)
        formData.append('file', file_value.files[0])

        if (file_value.files.length == 0) {
            showAlert("Select file")
            return
        }

        fetch(api_url + 'update_manufacturer_logo', {
            method: 'PUT',
            body: formData
        })
            .then((response) => response.json())
            .then((data) => {
                setLogo(data.manufacturer.logo)
                document.getElementById('manufacturer_logo').setAttribute('src', data.manufacturer.logo)
            })
            .catch((error) => {
                console.error('Error:', error);
            })
    }
    document.getElementById('btn_manufacturer_save_changes').addEventListener('click', function (evt) {
        const body = {
            name:     document.getElementById('manufacturer_name').value,
            country:  document.getElementById('manufacturer_country').value,
            website:  document.getElementById('manufacturer_website').value,
            email:    document.getElementById('manufacturer_email').value,
        }

        if (body.name == '' || body.type == '' || body.country == '' || body.website == '' ||
            body.email == '' || body.phone == '' ) {
            showAlert("Please fill all fields")
            return
        }

        sendRequest("post", 'update_manufacturer_info', body)
            .then(data => {
                showNotify("Saved")
            })
    });
    function setManufacturerInfo(info){
        document.getElementById('manufacturer_name').value    = info.name
        document.getElementById('manufacturer_country').value = info.country
        document.getElementById('manufacturer_website').value = info.website
        document.getElementById('manufacturer_email').value   = info.email
        document.getElementById('manufacturer_logo').setAttribute("src", info.logo)

    }

    ///// - MANAGE PROFILE ////









    ///// + MANAGE TICKETS ////
    Array.from(document.getElementsByClassName("tickets_filter")).forEach(function(element) {
        element.addEventListener('click', ticketFilter );
    });
    function ticketFilter(){
        let filter_type = this.getAttribute("data-type")

        Array.from(document.getElementsByClassName(`tickets_filter`)).forEach(function(element) {
            element.classList.remove("active")
            if (element.getAttribute('data-type') == filter_type) {
                element.classList.add("active")
            }
        });

        const all_types = ["to_me", "cc_me", "archive"]
        all_types.forEach(function(type){
            Array.from(document.getElementsByClassName(`div_tickets_${type}`)).forEach(function(element) {
                element.style.display = "none"

                if (filter_type == type ) {
                    element.style.display = "block"
                }
            });
        })


        if (filter_type == "archive") {
            showArchivedChats()
        }

    }
    function showArchivedChats(){
        sendRequest('post', 'get_archived_tickets', ticket_create )
            .then(data => {
                let has_archived = false
                data.tickets.forEach(function(element) {
                    if (element.open == false) has_archived = true
                });
                if (has_archived == false){
                    showNotify("You have no archived chats")
                    current_icon.src = 'img/show.svg'
                }

                setTickets(data.tickets)
            })
            .catch(err => console.log(err))

    }


    function setTickets(tickets){



        let html_open_my_tickets  = ''
        let html_open_cc_tickets  = ''
        let html_close_tickets = ''

        let navigation_badge = ''

        tickets.forEach((item, i) => {
            let selected = item.id == document.getElementsByClassName("btn_send_ticket_message")[0].getAttribute("data-ticket-id") ? "selected" : ""
            let margin_avatar = 0
            let avatars = ""
            item.main_users.forEach((user, i) => {
                avatars += `
                            <div class="container_round_image"  data-tippy-content="${user.name}" style="left: ${margin_avatar}px">
                                <img src="${user.avatar}"/>
                            </div>`
                margin_avatar += 25
            })

            let has_new_messsage = ""

            if (item.new_message > 0) {
                if (item.for_me) {
                    has_new_messsage = "new_important"
                } else {
                    has_new_messsage = "new"
                }
            }

            let message_counter = ''
            if (item.new_message == 0) {message_counter = ""}
            else if (item.new_message < 10) {message_counter = item.new_message}
            else {message_counter = "9+"}





            let html = `
                    <div class="ticket_container ${selected}" data-ticket-id="${item.id}">

                        <div class="div_ticket_header text_info">
                                 <div class="ticket_header">${item.ticket_header}</div>
                                <div class="ticket_message">${item.last_message}</div>
                        </div>

                        <div class="ticket_value">
                            <div class="ticket_image_container">
                                ${avatars}
                            </div>

                            <div class="tags">
                                <div class="ticket_time">${item.date_str}</div>
                                <div class="ticket_notify_container">
                                    <div class="ticket_notify ${has_new_messsage }">${message_counter}</div>
                                </div>
                            </div>
                        </div>

                    </div>
            `



            if (item.open) {
                if (item.for_me) {
                    html_open_my_tickets += html
                } else {
                    html_open_cc_tickets += html
                }

            } else {
                html_close_tickets += html
            }

        })



        Array.from(document.getElementsByClassName("container_my_tickets")).forEach(function(element) {
            element.innerHTML = `<div class="action-btn open_popup_ticket_create">Create chat</div>`
            element.innerHTML += html_open_my_tickets
        });
        Array.from(document.getElementsByClassName("container_cc_tickets")).forEach(function(element) {
            element.innerHTML = html_open_cc_tickets
        });


        Array.from(document.getElementsByClassName("container_close_tickets")).forEach(function(element) {
            element.innerHTML = ``
            if (html_close_tickets != "") {
                element.innerHTML += html_close_tickets
            }
        });

        Array.from(document.getElementsByClassName("open_popup_ticket_create")).forEach(function(element) {
            element.addEventListener('click', openPopupTicketCreate)
        });

        Array.from(document.getElementsByClassName("ticket_container")).forEach(function(element) {
            element.addEventListener('click', getTicket)
        });
    }
    function updateTickets(force){
        sendRequest("post", "get_tickets_front", {})
            .then(data => {
                let has_new_messsage = ""
                data.tickets.forEach((item, i) => {
                    if (has_new_messsage != "new_important") {
                        if (item.new_message) {
                            if (item.for_me) {
                                has_new_messsage = "new_important"
                            } else {
                                has_new_messsage = "new"
                            }
                        }
                    }
                })

                let ticket_list = 'to_me'
                if (has_new_messsage == 'new'){
                    ticket_list = "cc_me"
                }

                Array.from(document.querySelectorAll(`.tickets_list`)).forEach(function(element, i) {
                    element.style.display = 'none'
                    if (element.classList[0].includes(ticket_list)) {
                        element.style.display = 'block'
                    }
                })

                Array.from(document.querySelectorAll(`.tickets_filter`)).forEach(function(element, i) {
                    element.classList.remove('active')
                    if (element.getAttribute("data-type").includes(ticket_list)) {
                        element.classList.add('active')
                    }
                })


                Array.from(document.querySelectorAll(`.nav_badge[data-type="chats"]`)).forEach(function(element, i) {
                    element.classList.remove('new')
                    element.classList.remove('new_important')

                    if (has_new_messsage != '') {
                        element.classList.add(has_new_messsage)
                    }
                })

                if (force || !deepEqual(main_data.tickets, data.tickets)) {
                    main_data.tickets = data.tickets
                    setTickets(data.tickets)
                }
            })
            .catch(err => console.log(err))
    }


    let ticket_create = {
        ticket_my_organization: "",
        ticket_for_organization: "",
        ticket_for_users: [],
        ticket_for_seems: [],
        ticket_type:      "",
        ticket_product:   "",
        ticket_industry:  "",
    }
    function openPopupTicketCreate(){
        showPopup("ticket_create")
        document.getElementById('btn_create_ticket_step_1').style.display = 'block'
        document.getElementById('div_ticket_product').style.display = 'none'
        document.getElementById('div_ticket_industry').style.display = 'none'
        document.getElementById('btn_create_ticket').style.display = 'none'
        document.getElementById("div_ticket_users").style.display = 'none'
        document.getElementById("div_ticket_can_see").style.display = 'none'

        document.getElementById("div_ticket_find_reciever").style.display = 'none'
        document.getElementById("ticket_find_reciever").value = ''
        document.getElementById("div_ticket_find_cc").style.display = 'none'
        document.getElementById("ticket_find_cc").value       = ''

        document.getElementById('ticket_create_for_organization').value = ''
        document.getElementById('ticket_create_type').value = ''
        document.getElementById('ticket_create_product').value = ''
        document.getElementById('ticket_create_industry').value = ''
    }
    function showTicketReciever(){
        let my_users  = ticket_create.ticket_my_organization.users
        let all_users = ticket_create.ticket_for_organization.users


        // Проверяем на регион
        let new_my_users = []
        my_users.forEach(function(item){
            if (item.regions.split(",").includes(ticket_create.ticket_for_organization.region)) {
                new_my_users.push(item)
            }
        })



        // Проверка на свою организацию
        let users_for = arraysEqual(all_users, new_my_users) ? all_users : all_users.concat(new_my_users)


        let html_acitve_list = ''
        users_for.forEach(function(item){
            html_acitve_list += `<div class="container_round_image ticket_create_users shadow" data-user-id="${item.id}" data-tippy-content="${item.name}">
                                     <img src="${item.avatar}"/>
                                     <div class='shadow'></div>
                                 </div>`
        })
        html_acitve_list += `<div class="container_round_image ticket_create_users shadow" data-user-id="0" data-tippy-content="Add other">
                                <img src="img/add_chat.svg"/>
                             </div>`
        document.getElementById('list_ticket_users').innerHTML = html_acitve_list
        document.getElementById("div_ticket_users").style.display = 'block'

        tippy('.container_round_image, .locked', {
            followCursor: 'horizontal',
            animation: 'fade',
        });

        Array.from(document.getElementsByClassName("ticket_create_users")).forEach(function(element) {
            element.addEventListener('click', changeTicketUsers );
        });

    }
    function changeTicketUsers(){
        const selected_user_id = parseInt(this.getAttribute("data-user-id"))
        if (selected_user_id == 0){
            createTicketRecieversElement()
            this.style.display = 'none'
            return
        }

        if (this.classList.contains("selected")) {
            document.getElementById('div_ticket_can_see').style.display = 'none'
            document.getElementById('btn_create_ticket').style.display  = 'none'
            document.getElementById('btn_create_ticket_step_1').style.display  = 'block'

            this.classList.remove("selected")
            ticket_create.ticket_for_users = ticket_create.ticket_for_users.filter((user_id) => {
                return user_id != selected_user_id
            })
        } else {
            document.getElementById('btn_create_ticket_step_1').style.display  = 'block'

            this.classList.add("selected")
            ticket_create.ticket_for_users.push(selected_user_id)
        }

        if (ticket_create.ticket_for_users.length == 0) {
            Array.from(document.getElementById('list_ticket_users').getElementsByClassName("ticket_create_users")).forEach(function(element) {
                if (!element.classList.contains("selected")) {
                    //element.style.display = 'block'
                }
            })
            document.getElementById('div_ticket_find_reciever').style.display = 'block'
            document.getElementById('btn_create_ticket_step_1').style.display = 'block'
            document.getElementById('div_ticket_can_see').style.display = 'none'
            document.getElementById('btn_create_ticket').style.display = 'none'

        }

        console.log("ticket_create.ticket_for_users ", ticket_create.ticket_for_users)
        tippy('.container_round_image, .locked', {
            followCursor: 'horizontal',
            animation: 'fade',
        });
    }
    function addUserToTicketReciever(value){
        let organization_name = value.split("(")[1]
        organization_name = organization_name.slice(0, -1)

        let user_name = value.split("(")[0]
        user_name = user_name.slice(0, -1)

        console.log("organization_name ", organization_name)
        console.log("user_name ", user_name)

        let added_user = null
        main_data.ticket_organizations.together.forEach((organization) => {
            if (organization.name == organization_name) {
                organization.users.forEach((user) => {
                    if (user.name == value) {
                        added_user = user
                    }
                })
            }
        })
        console.log("added_user ", added_user)

        ticket_create.ticket_for_users.push(parseInt(added_user.id))

        createTicketRecieversElement()

        // Если пользователь уже есть в отображаемом списке, то не добавляя, просто выделяем
        let user_in_list = false
        Array.from(document.getElementById('list_ticket_users').getElementsByClassName("ticket_create_users")).forEach(function(element) {
            if (parseInt(element.getAttribute("data-user-id")) == added_user.id) {
                element.classList.add("selected")
                user_in_list = true
            }
        });

        // Иначе вставляем к существующим
        if (!user_in_list) {
            let user_html = `<div class="container_round_image ticket_create_users shadow selected" data-user-id="${added_user.id}" data-tippy-content="${added_user.name}">
                                     <img src="${added_user.avatar}"/>
                                     <div class='shadow'></div>
                                 </div>`
            document.getElementById('list_ticket_users').innerHTML += user_html

            Array.from(document.getElementsByClassName("ticket_create_users")).forEach(function(element) {
                element.addEventListener('click', changeTicketUsers );
            });
        }
        tippy('.container_round_image, .locked', {
            followCursor: 'horizontal',
            animation: 'fade',
        });
    }
    function createTicketRecieversElement(){
        let all_recievers = []
        console.log(" ticket_create.ticket_for_users ", ticket_create.ticket_for_users)
        main_data.ticket_organizations.together.forEach((organization) => {
            organization.users.forEach((user) => {
                if (!ticket_create.ticket_for_users.includes(user.id)) {
                    all_recievers.push(user.name)
                }
            })
        })
        document.getElementById("ticket_find_reciever").value = ''

        autocomplete(document.getElementById("ticket_find_reciever"), all_recievers, true, "", true);
        document.getElementById("div_ticket_find_reciever").style.display = 'block'
    }

    document.getElementById('btn_create_ticket_step_1').addEventListener('click', function(){
        if (ticket_create.ticket_for_users.length == 0) {
            showNotify("Select at least one recipient")
            return
        }

        document.getElementById("div_ticket_find_reciever").style.display = 'none'
        document.getElementById("btn_create_ticket_step_1").style.display = 'none'
        Array.from(document.getElementById('list_ticket_users').getElementsByClassName("ticket_create_users")).forEach(function(element) {
            if (!element.classList.contains("selected")) {
                element.style.display = 'none'
            }
        });

        sendRequest('post', 'get_can_see_chat', ticket_create)
            .then(data => {
                showTicketCC(data.can_see, data.can_see_ids)

            })
            .catch(err => console.log(err))

    })

    function showTicketCC(can_see, can_see_ids){
        document.getElementById("div_ticket_can_see").style.display = 'flex'
        document.getElementById("btn_create_ticket").style.display  = 'block'


        let html_cansee_list = ''
        can_see.forEach(function(item){
            let locked = '<img src="img/lock.svg" class="locked" data-tippy-content="Obligatory copy" />'

            html_cansee_list += `<div class="container_round_image ticket_create_users_to_seem shadow  selected locked_user"  data-user-id="${item.id}" data-tippy-content="${item.name}">
                                    <img src="${item.avatar}"/>
                                    ${locked}
                                 </div>`
        })

        html_cansee_list += `<div class="container_round_image ticket_create_users_to_seem shadow" data-user-id="0" data-tippy-content="Add other">
                                <img src="img/add_chat.svg"/>
                             </div>`
        document.getElementById('list_ticket_can_see').innerHTML = html_cansee_list


        Array.from(document.getElementsByClassName("ticket_create_users_to_seem")).forEach(function(element) {
            element.addEventListener('click', changeTicketUsersSee );
        });


        if (can_see.length == 0){
            document.getElementById('list_ticket_can_see').innerHTML = ''
            createTicketCCElement()
            return
        }

        ticket_create.ticket_for_seems = can_see_ids

        console.log(" ticket_create.ticket_for_users ", ticket_create.ticket_for_users)
        console.log(" can_see_ids ", can_see_ids)
        console.log(" ticket_create.ticket_for_seems ", ticket_create.ticket_for_seems)


        tippy('.container_round_image, .locked', {
            followCursor: 'horizontal',
            animation: 'fade',
        });
    }
    function createTicketCCElement(){
        let all_cc = []
        console.log(" ticket_create.ticket_for_users ", ticket_create.ticket_for_users)
        console.log(" ticket_create.ticket_for_seems ", ticket_create.ticket_for_seems)
        main_data.ticket_organizations.together.forEach((organization) => {
            organization.users.forEach((user) => {
                if (!ticket_create.ticket_for_users.includes(user.id) && !ticket_create.ticket_for_seems.includes(user.id)) {
                    all_cc.push(user.name)
                }
            })
        })
        document.getElementById("ticket_find_cc").value = ''

        autocomplete(document.getElementById("ticket_find_cc"), all_cc, true, "", true);
        document.getElementById("div_ticket_find_cc").style.display = 'block'
    }
    function addUserToTicketCC(value){
        let organization_name = value.split("(")[1]
        organization_name = organization_name.slice(0, -1)

        let user_name = value.split("(")[0]
        user_name = user_name.slice(0, -1)

        console.log("organization_name ", organization_name)
        console.log("user_name ", user_name)
        let added_user = null
        main_data.ticket_organizations.together.forEach((organization) => {
            if (organization.name == organization_name) {
                organization.users.forEach((user) => {
                    if (user.name == value) {
                        added_user = user
                    }
                })
            }
        })

        ticket_create.ticket_for_seems.push(added_user.id)

        createTicketCCElement()

        // Если пользователь уже есть в отображаемом списке, то не добавляя, просто выделяем
        let user_in_list = false
        Array.from(document.getElementById('list_ticket_can_see').getElementsByClassName("ticket_create_users_to_seem")).forEach(function(element) {
            if (parseInt(element.getAttribute("data-user-id")) == added_user.id) {
                element.classList.add("selected")
                user_in_list = true
            }
        });

        // Иначе вставляем к существующим
        if (!user_in_list) {
            let user_html = `<div class="container_round_image ticket_create_users_to_seem shadow selected" data-user-id="${added_user.id}" data-tippy-content="${added_user.name}">
                                     <img src="${added_user.avatar}"/>
                                     <div class='shadow'></div>
                                 </div>`
            document.getElementById('list_ticket_can_see').innerHTML += user_html

            Array.from(document.getElementsByClassName("ticket_create_users_to_seem")).forEach(function(element) {
                element.addEventListener('click', changeTicketUsersSee );
            });
        }

        tippy('.container_round_image, .locked', {
            followCursor: 'horizontal',
            animation: 'fade',
        });
    }
    function changeTicketUsersSee(){
        const selected_user_id = this.getAttribute("data-user-id")
        if (selected_user_id == "0"){
            createTicketCCElement()
            this.style.display = 'none'
            return
        }

        if (this.classList.contains("selected")) {
            if (!this.classList.contains("locked_user")) {
                this.classList.remove("selected")
                ticket_create.ticket_for_seems = ticket_create.ticket_for_seems.filter((user_id) => {
                    return user_id != selected_user_id
                })
            }

        } else {
            this.classList.add("selected")
            ticket_create.ticket_for_seems.push(selected_user_id.toString())
        }



    }

    document.getElementById('btn_create_ticket').onclick = function() {
        showPopup("ticket_create")

        ticket_create.ticket_type     =  document.getElementById('ticket_create_type').value
        ticket_create.ticket_product  =  document.getElementById('ticket_create_product').value
        ticket_create.ticket_industry =  document.getElementById('ticket_create_industry').value

        let error = false
        if (ticket_create.ticket_type == 'product' && ticket_create.ticket_product == '') { error = true }
        if (ticket_create.ticket_type == 'application' && ticket_create.ticket_industry == '') { error = true }
        if (ticket_create.ticket_type == '') {error = true}
        if (ticket_create.ticket_for_users.length == 0) {error = true}

        if (error){
            showAlert("Fill all fields")
        } else {
            sendRequest('post', 'create_ticket', ticket_create )
                .then(data => {
                    setTickets(data.tickets)
                    openTicket(data.ticket_info.ticket.id)
                    closePopup()
                    showNotify("Send your question to chat")

                    Array.from(document.getElementsByClassName("ticket_message_text")).forEach(function(element) {
                        element.classList.add("ticket_focus")
                        setTimeout(() => {element.classList.remove("ticket_focus")}, 4000);
                    });

                })
                .catch(err => console.log(err))
        }
    }



    function getTicket(){
        closeQuotedDiv()

        // Array.from(document.getElementsByClassName("ticket_container")).forEach(function(element) {
        //     element.classList.remove("selected")
        // });
        // this.classList.add("selected")

        this.getElementsByClassName("ticket_notify")[0].classList.remove("new")
        this.getElementsByClassName("ticket_notify")[0].classList.remove("new_important")


        openTicket(this.getAttribute("data-ticket-id"))
    }
    function openTicket(ticket_id) {
        sendRequest('post', 'get_ticket_info', {
            ticket_id:        ticket_id
        } )
            .then(data => {
                drawTicket(data)
            })
            .catch(err => console.log(err))
    }

    function setTicketStage(stage){
        let left_display  = 'block'
        let right_display = 'none'

        if (stage == "chat") {
            left_display  = 'none'
            right_display = 'block'
        }

        Array.from(document.querySelectorAll(".ticket_wrapper.left")).forEach(function(element) {
            element.style.display = left_display
        })
        Array.from(document.querySelectorAll(".ticket_wrapper.right")).forEach(function(element) {
            element.style.display = right_display
        })
    }
    function drawTicket(data){
        console.log("data ", data)

        document.getElementById('ticket_lang_buyer').value = main_data.cabinet_info.chat_lang
        document.getElementById('ticket_lang_buyer').setAttribute("data-ticket-id", data.ticket.id)
        document.getElementById('ticket_lang_manufacturer').setAttribute("data-ticket-id", data.ticket.id)
        document.getElementById('ticket_lang_manufacturer').value = main_data.cabinet_info.chat_lang

        setTicketStage("chat")


        Array.from(document.getElementsByClassName("ticket_subject")).forEach(function(element) {
            element.innerHTML = data.ticket.ticket_header

            if (data.ticket.ticket_type == "Product") {
                let link = `https://yourpartners.net/certificates/specs/${data.ticket.ticket_object}.pdf`
                element.innerHTML += `<a href="${link}" target="_blank"><img class="ticket_pdf" src="img/link_pdf.svg"/></a>`
            }
        });



        let html_participant = []
        let html_observer = []
        let margin_participant = 0
        let margin_observer    = 0

        data.ticket.ticket_users.forEach(function(element) {

            if (element.role == "participant") {
                html_participant.push(`
                <div class="container_round_image"  data-tippy-content="${element.name}" style="left: ${margin_participant}px">
                                <img src="${element.avatar}"/>
                            </div>`)
                margin_participant += 25
            } else {
                html_observer.push(`
                <div class="container_round_image"  data-tippy-content="Copy to: ${element.name}" style="left: ${margin_observer}px">
                                <img src="${element.avatar}"/>
                                <div class="shadow"></div>
                            </div>`)
                margin_observer    += 25
            }
        })
        Array.from(document.getElementsByClassName("container_main")).forEach(function(element) {
            element.innerHTML = html_participant.join("")

        });
        Array.from(document.getElementsByClassName("container_see")).forEach(function(element) {
            element.innerHTML = html_observer.reverse().join("")

        });





        Array.from(document.getElementsByClassName("ticket_opened")).forEach(function(element) {
            element.innerHTML = data.ticket.opened
        });
        Array.from(document.getElementsByClassName("btn_send_ticket_message")).forEach(function(element) {
            element.setAttribute("data-ticket-id", data.ticket.id)
        });
        Array.from(document.getElementsByClassName("btn_send_ticket_file")).forEach(function(element) {
            element.setAttribute("data-ticket-id", data.ticket.id)
        });
        Array.from(document.getElementsByClassName("ticket_translate")).forEach(function(element) {
            element.setAttribute("data-ticket-id", data.ticket.id)
        });


        let archive_display = 'none'
        let reopen_display = 'none'
        if (data.ticket.mine){
            if (data.ticket.open){
                archive_display = 'block'
            } else {
                reopen_display = 'block'
            }
        }


        Array.from(document.getElementsByClassName("ticket_archive")).forEach(function(element) {
            element.style.display = archive_display
            element.addEventListener('click', ticketClosePopup)
            element.setAttribute("data-ticket-id", data.ticket.id)
        });
        Array.from(document.getElementsByClassName("ticket_reopen")).forEach(function(element) {
            element.style.display = reopen_display
            element.addEventListener('click', ticketReopenPopup)
            element.setAttribute("data-ticket-id", data.ticket.id)
        });




        setTicketChat(data.ticket_messages)



        tippy('.ticket_opened, .ticket_archive, .ticket_reopen, .container_round_image, .btn_send_ticket_message, .btn_send_ticket_file', {
            followCursor: 'horizontal',
            animation: 'fade',
        });
    }
    let ticket_messages_important_interval = null
    function setTicketChat(messages){

        Array.from(document.getElementsByClassName("ticket_chat_messages_container")).forEach(function(element) {
            let html = ''
            messages.forEach((item, i) => {
                let file_img = ''
                let file_download = ''

                if (item.message_type == 'file') {
                    file_img = '<div class="div_img"><img src="img/file.svg"/></div>'
                    file_download = 'ticket_file_download'
                }

                let quote = ''
                if (item.quoted_message != null){
                    quote = ` <div class="container_message_quoted">
                                   <div class="quoted_name">${item.quoted_message.sender_name}</div>
                                   <div class="quoted_text">${item.quoted_message.text_to}</div>
                              </div> `
                }


                const avatar  = `<img class="message_sender" src="${item.avatar}">`
                const message = `<div class="ticket_message_div ${file_download}" data-message-id="${item.id}" data-sender-name="${item.sender_name}" data-file-name="${item.file_name}">
                                    ${quote}
                                    <div class="container_message_text">
                                         ${file_img}
                                         <div class="value">${item.text_to}</div>
                                         <div class="date">${item.message_date}</div>
                                    </div>
                                 </div>`

                let translation = ''
                if (item.has_translate && item.message_type != 'file' ){
                    translation = `<img class="translation" data-tippy-content="Original (${item.lang_from}): ${item.text_from}" data-original="${item.text_from}" src="img/translation.svg" />`
                }
                let quote_icon = `<img src="img/quote.svg" class="quote_message" />`

                let important_class = ``
                let important_tippy = "Urgent"
                let important_icon  = "fire_false"
                if (item.answer_day != "") {
                    important_class = 'important'
                    important_tippy = "Remove urgent"
                    important_icon  = "fire_true"
                }


                let important_img   = `
                    <div class="div_ticket_highlight">
                         <img class="ticket_highlight" src="img/${important_icon}.svg" data-tippy-content="${important_tippy}"/>
                         <div class="ticket_message_answer_day" data-tippy-content="Request status">${item.answer_day}</div>
                    </div>`


                if (item.mine){
                    html += `<div data-message-id="${item.id}"  data-message-num="${item.message_num}" class="ticket_message_container ${important_class} mine">
                                      ${important_img}
                                      ${translation}
                                      ${message}
                                      ${avatar}
                             </div>`
                } else {
                    html += `<div data-message-id="${item.id}" data-message-num="${item.message_num}" data-sender-name="${item.sender_name}" class="ticket_message_container ${important_class}">
                                        ${avatar}
                                        ${message}
                                        ${translation}
                                        ${quote_icon}
                                     </div>`
                }
            })

            element.innerHTML = html




            Array.from(element.getElementsByClassName("ticket_message_container")).forEach(function(element) {
                let highlight   = element.getElementsByClassName('div_ticket_highlight')[0]
                let translation = element.getElementsByClassName('translation')[0]
                let quote_icon = element.getElementsByClassName('quote_message')[0]

                element.addEventListener("mouseenter", (e) => {
                    if (typeof highlight   != 'undefined') { highlight.style.display   = "flex" }
                    if (typeof translation != 'undefined') { translation.style.display = "block" }
                    if (typeof quote_icon != 'undefined') { quote_icon.style.display = "block" }


                });
                element.addEventListener("mouseleave", (e) => {
                    if (typeof highlight   != 'undefined') { highlight.style.display   = "none" }
                    if (typeof translation != 'undefined') { translation.style.display = "none" }
                    if (typeof quote_icon != 'undefined') { quote_icon.style.display = "none" }

                });
            });
            Array.from(element.getElementsByClassName("ticket_highlight")).forEach(function(element) {
                element.addEventListener('click', ticketHighlight)
            });
            Array.from(element.getElementsByClassName("translation")).forEach(function(element) {
                element.addEventListener('click', copyOriginal)
            });
            Array.from(element.getElementsByClassName("ticket_file_download")).forEach(function(element) {
                element.addEventListener('click', ticketFileDownload)
            });
            Array.from(element.getElementsByClassName("quote_message")).forEach(function(element) {
                element.addEventListener('click', quoteMessage)
            });

        });

        Array.from(document.getElementsByClassName("ticket_chat_messages_container")).forEach(function(element) {
            setTimeout(() => {element.scrollTo(0,10000)}, 100)
        })

        //startMessageTimer()



        function startMessageTimer(){

            if (ticket_messages_important_interval != null){
                clearInterval(ticket_messages_important_interval)
            }

            ticket_messages_important_interval = setInterval(() => {
                console.log("ticket_messages_important_interval")
                Array.from(document.getElementsByClassName("ticket_message_answer_day")).forEach(function(element) {
                    let time_left = parseInt(element.getAttribute("data-time-left"))

                    if (time_left > 0){
                        let seconds = time_left
                        let minutes = Math.floor(seconds/60);
                        let hours = Math.floor(minutes/60);
                        let days = Math.floor(hours/24);

                        hours = hours-(days*24);
                        minutes = minutes-(days*24*60)-(hours*60);
                        seconds = seconds-(days*24*60*60)-(hours*60*60)-(minutes*60);

                        minutes = minutes < 10 ? `0${minutes}` : minutes
                        seconds = seconds < 10 ? `0${seconds}` : seconds

                        element.setAttribute("data-time-left", time_left - 1)
                        element.innerText = `Left ${hours}:${minutes}:${seconds}`
                    } else if (time_left < 0) {
                        element.setAttribute("data-time-left", time_left - 1)
                        element.innerText = `Overtime`
                    } else {
                        element.innerText = ``
                    }

                });
            }, 1000);
        }
        function  copyOriginal(){
            copyToClipboard(this.getAttribute("data-original"))
        }

        tippy('.translation, .ticket_highlight, .ticket_message_answer_day', {
            content: 'My tooltip!',
            followCursor: 'horizontal',
            animation: 'fade',
        });
    }


    Array.from(document.getElementsByClassName("btn_send_ticket_message")).forEach(function(element) {
        element.addEventListener('click', sendTicketMessage)
    });
    Array.from(document.getElementsByClassName("btn_send_ticket_file")).forEach(function(element) {
        element.addEventListener('click', createTicketFile)
    });
    function sendTicketMessage(){
        const parent = this.parentElement
        const textarea = parent.getElementsByClassName('ticket_message_text')[0]
        const message = textarea.value
        const ticket_id = this.getAttribute("data-ticket-id")

        if (message == "") {
            showAlert("Write your message")
        } else {
            sendRequest("post", "create_ticket_message", {message: message, ticket_id: ticket_id, quoted_message_num: quoted_message_num})
                .then(data => {
                    closeQuotedDiv()
                    drawTicket(data.ticket_info)
                    textarea.value = ''
                    updateTickets(true)
                })
                .catch(err => console.log(err))
        }
    }


    document.getElementById('ticket_file_name').onclick = function(){
        document.getElementById('send_ticket_file').click()
    }
    document.getElementById('send_ticket_file').onchange = function(){
        console.log("change ", this.files);
        console.log("change ", this.files[0]);
        document.getElementById('ticket_file_name').value = this.files[0].name

    }
    function createTicketFile(){
        showPopup("ticket_file")
        document.getElementById('ticket_file_name').value = ""
        document.getElementById('send_ticket_file').click()
        document.getElementById('btn_send_ticket_file').setAttribute("data-ticket-id", this.getAttribute("data-ticket-id") )
    }
    document.getElementById('btn_send_ticket_file').onclick = function(){
        const formData = new FormData();
        const file_value = document.getElementById('send_ticket_file');
        const file_name  = document.getElementById('ticket_file_name').value;

        formData.append('sender_id', main_data.user.id);
        formData.append('ticket_id', this.getAttribute("data-ticket-id"));
        formData.append('file_name', file_name);
        formData.append('token',     cookie_token)
        formData.append('file', file_value.files[0]);


        if (file_value.files.length == 0) {
            showAlert("Select file")
            return;
        }

        fetch(api_url + 'save_file_for_ticket', {
            method: 'PUT',
            body: formData
        })
            .then((response) => response.json())
            .then((data) => {
                console.log('Success:', data);
                setTicketChat(data.ticket_messages)
                closePopup()
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }
    let ticket_file_name = ''
    function ticketFileDownload(){
        ticket_file_name = this.getAttribute("data-file-name")
        downloadTicketFile(this.getAttribute("data-message-id"))
    }
    function downloadTicketFile(message_id){
        const formData  = new FormData();
        formData.append("message_id", message_id);

        const headers = {
            'Authorization': 'Token token=' + cookie_token,
            //'Content-type': 'application/json'
        }

        fetch(`${api_url}download_ticket_file`, {
            method: "post",
            headers: headers,
            body: formData
        }).then(response => response.blob() )
            .then(blob => {
                var url = window.URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = ticket_file_name;
                document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
                a.click();
                a.remove();  //afterwards we remove the element again
            });
    }

    let quoted_message_num = null
    function quoteMessage(){
        const all_message = this.parentElement
        quoted_message_num = all_message.getAttribute("data-message-num")
        let its_file = all_message.getElementsByClassName('ticket_message_div')[0].classList.contains("ticket_file_download")
        its_file = its_file ? "File: " : ""

        let message_text = all_message.getElementsByClassName('value')[0].innerText
        let quoted_text = its_file + all_message.getElementsByClassName('value')[0].innerText
        if (quoted_text.length > 40) {
            quoted_text = message_text.substring(0,37) + "..."
        }
        let sender_name = all_message.getAttribute("data-sender-name")

        Array.from(document.getElementsByClassName("div_ticket_message_quote")).forEach(function(div) {
            div.style.display = "block"
            div.getElementsByClassName('name')[0].innerText = sender_name
            div.getElementsByClassName('quote_text')[0].innerText = quoted_text
        });

        Array.from(document.getElementsByClassName("ticket_chat_messages_container")).forEach(function(element) {
            setTimeout(() => {element.scrollTo(0,10000)}, 100)
        })

    }
    Array.from(document.getElementsByClassName("quote_cancel")).forEach(function(element) {
        element.addEventListener('click', closeQuotedDiv)
    });
    function closeQuotedDiv(){
        quoted_message_num = null
        Array.from(document.getElementsByClassName("div_ticket_message_quote")).forEach(function(element) {
            element.style.display = 'none'
        });
    }


    function ticketHighlight(){
        let current_element = this
        let parent = this.parentElement.parentElement
        let message_id = parent.getAttribute("data-message-id")
        let active = this.src.includes("fire_true.svg")


        sendRequest('post', 'highlight_ticket_message', { message_id: message_id } )
            .then(data => {
                showNotify("Updated")

                if (active){
                    parent.classList.remove("important")
                    current_element.src = 'img/fire_false.svg'
                } else {
                    parent.classList.add("important")
                    current_element.src = 'img/fire_true.svg'
                }

                setTicketChat(data.ticket_messages)
            })
            .catch(err => console.log(err))


        console.log('message_id ', message_id)
        console.log('active ', active)
    }


    function translateTicketChat(ticket_id, lang){
        main_data.cabinet_info.chat_lang = lang

        sendRequest('post', 'translate_all_messages', {
            ticket_id:        ticket_id,
            lang:             lang
        } )
            .then(data => {
                main_data.cabinet_info.chat_lang = lang
                setTicketChat(data.ticket_messages)
            })
            .catch(err => console.log(err))
    }


    function ticketClosePopup(){
        showPopup("ticket_close")
        document.getElementById("btn_close_ticket").setAttribute("data-ticket-id", this.getAttribute("data-ticket-id"))
    }
    function ticketReopenPopup(){
        showNotify("To reactivate chat, just write message")
    }
    document.getElementById('btn_close_ticket').onclick = function() {
        sendRequest('post', 'ticket_close', {
            ticket_id:       this.getAttribute("data-ticket-id")
        } )
            .then(data => {
                setTickets(data.tickets)
                setTicketStage("list")

                closePopup()
            })
            .catch(err => console.log(err))
    }
    document.getElementById('btn_reopen_ticket').onclick = function() {
        sendRequest('post', 'ticket_reopen', {
            ticket_id:       this.getAttribute("data-ticket-id")
        } )
            .then(data => {
                setTickets(data.tickets)
                setTicketStage("list")

                closePopup()
            })
            .catch(err => console.log(err))
    }

    ///// - MANAGE TICKETS ////






    ///// + MANAGE PLANNING ////
    Array.from(document.querySelectorAll(".btns-planning-year")).forEach(function(element) {
        element.addEventListener('click', setPlanningSettings );
    });
    Array.from(document.querySelectorAll(".btns-planning-raf")).forEach(function(element) {
        element.addEventListener('click', setPlanningSettings );
    });
    Array.from(document.querySelectorAll(".btns-planning-month")).forEach(function(element) {
        element.addEventListener('click', setPlanningSettings );
    });
    Array.from(document.querySelectorAll(".btns-planning-type")).forEach(function(element) {
        element.addEventListener('click', setPlanningSettings );
    });
    function setPlanningSettings(){
        let parent = this.parentElement.parentElement.parentElement.parentElement

        parent.classList.add("updated")
        let plan_changed = false
        if (this.classList.contains('btns-planning-month')){
            data_planning.month =  parseInt(this.getAttribute("data-value"))
            dd_filter_planning_month.close()
        }
        if (this.classList.contains('btns-planning-raf')){
            plan_changed = true
            data_planning.raf     =  parseInt(this.getAttribute("data-value"))
            dd_filter_planning_raf.close()

            let min_month = 0
            if (data_planning.raf > 1) {
                min_month = (data_planning.raf - 1) * 3 + 1
            }

            if (data_planning.month < min_month) {
                data_planning.month = min_month
                document.getElementById('filter_planning_month').innerHTML = `Month: ${min_month}`
            }

            Array.from(document.getElementsByClassName('btns-planning-month')).forEach(function(element) {
                const month = parseInt(element.getAttribute('data-value'))
                element.style.display = month >= min_month ? 'block' : 'none'
            })
        }
        if (this.classList.contains('btns-planning-year')){
            plan_changed = true
            data_planning.year = parseInt(this.getAttribute("data-value"))
            dd_filter_planning_year.close()
        }
        if (this.classList.contains('btns-planning-type')){
            data_planning.type = this.getAttribute("data-value")
            dd_filter_planning_type.close()
        }

        setPlanningFilters()


        if (plan_changed){
            document.getElementById('table_planning').style.display = 'none'
            document.getElementById('btn_update_planning').style.display = 'block'
        } else {
            changePlanningTable()
        }

    }


    let dd_filter_planning_regions  = null
    let dd_filter_planning_year  = null
    let dd_filter_planning_raf  = null
    let dd_filter_planning_month  = null
    let dd_filter_planning_type  = null

    let planning_filter_regions = null
    let data_planning = {regions: 'russiacis,eu,mea,apac,americas', year: 2022, raf: 1, month: 100, type: 'volume', headers: {}}
    function createPlanningMainFilters(){
        data_planning.regions = user_regions.split(",")

        createPlanningFilterRegions()
        onChangeRegion()

        function createPlanningFilterRegions(){
            let html = ''
            user_regions.split(",").forEach((item, i) => {
                html += `<option class="planning_filter_region" data-value="${item}">${item}</option>`
            })
            document.getElementById("planning_filter_regions").innerHTML = html
            planning_filter_regions = new vanillaSelectBox(
                "#planning_filter_regions",
                {"maxHeight":300,
                    search:true,
                    translations : { "all": "All regions", "items": "regions"}
                })
        }

        function onChangeRegion(){
            Array.from(document.querySelectorAll(".planning_filter_region")).forEach(function(element) {
                element.addEventListener('click', changePlannignRegion );
            })

            function changePlannignRegion(){
                setTimeout(() => {
                    data_planning.regions = planning_filter_regions.getResult()
                    document.getElementById('table_planning').style.display = 'none'
                    document.getElementById('btn_update_planning').style.display = 'block'
                }, 500)

            }
        }
    }
    function createPlanningDetailFilters(){
        createPlanningFilterCustomers()
        //createPlanningFilterRaws()
        //createPlanningFilterTypes()
        createPlanningFilterProducts()
        onClickPlanningDetailItem()


        function createPlanningFilterCustomers(){

            let html = ''
            main_data.buyers.map(a => a.name).forEach((item, i) => {
                html += `<option class="plan_detail_filter_customer" data-value="${item}">${item}</option>`
            })
            document.getElementById("plan_detail_filter_customers").innerHTML = html
            plan_detail_filter_customers = new vanillaSelectBox(
                "#plan_detail_filter_customers",
                {"maxHeight":300,
                    search:true,
                    translations : { "all": "All customers", "items": "customers"}
                })

        }
        function createPlanningFilterRaws(){

            plan_detail_filter_raws = new vanillaSelectBox(
                "#plan_detail_filter_raws",
                {"maxHeight":300,
                    search:true,
                    translations : { "all": "All raws", "items": "raws"}
                })
        }
        function createPlanningFilterTypes(){

            plan_detail_filter_types = new vanillaSelectBox(
                "#plan_detail_filter_types",
                {"maxHeight":300,
                    search:true,
                    translations : { "all": "All types", "items": "types"}
                })
        }
        function createPlanningFilterProducts(){


            let products = main_data.products.map(a => a.name)
            let html = ''
            products.forEach((item, i) => {
                html += `<option class="plan_detail_filter_product" data-value="${item}">${item}</option>`
            })
            document.getElementById("plan_detail_filter_products").innerHTML = html
            plan_detail_filter_products = new vanillaSelectBox(
                "#plan_detail_filter_products",
                {"maxHeight":300,
                    search:true,
                    translations : { "all": "All products", "items": "products"}
                })
        }

        function onClickPlanningDetailItem(){

            Array.from(document.querySelectorAll(".plan_detail_filter_types, .plan_detail_filter_raws, .plan_detail_filter_product ")).forEach(function(element) {
                element.addEventListener('click', setNewFilterProducts );
            });



            Array.from(document.querySelectorAll(".plan_detail_filter_customer")).forEach(function(element) {
                element.addEventListener('click', showBtnPlanningUpdate );
            });


            function setNewFilterProducts(){

                setTimeout(() => {
                    let selected_types = []
                    let selected_raws  = []
                    let selected_products  = []
                    if (this.classList.contains('plan_detail_filter_types')) {
                        onChangeType()
                    } else if (this.classList.contains('plan_detail_filter_raws')) {
                        onChangeRaw()
                    } else if (this.classList.contains('plan_detail_filter_product')) {
                        onChangeProduct()
                    }

                    showBtnPlanningUpdate()


                    function onChangeType(){
                        selected_types = plan_detail_filter_types.getResult()
                        main_data.products.forEach((product) => {
                            if (selected_types.includes(product.category)) {
                                selected_products.push(product.name)

                                let product_raw = product.raw.toUpperCase()
                                if (!selected_raws.includes(product_raw)) {
                                    selected_raws.push(product_raw)
                                }
                            }
                        })

                        if (selected_types.length == 0) {
                            plan_detail_filter_products.setValue('all')
                            plan_detail_filter_raws.setValue('all')
                        } else {
                            plan_detail_filter_products.setValue(selected_products)
                            plan_detail_filter_raws.setValue(selected_raws)
                        }
                    }

                    function onChangeRaw(){
                        console.log("onChangeRaw ")
                        selected_raws = plan_detail_filter_raws.getResult()
                        main_data.products.forEach((product) => {
                            if (selected_raws.includes(product.raw.toUpperCase())) {
                                selected_products.push(product.name)

                                let product_category = product.category.toUpperCase()
                                if (!selected_types.includes(product_category)) {
                                    selected_types.push(product_category)
                                }
                            }
                        })

                        console.log("selected_raws ")

                        if (selected_raws.length == 0) {
                            plan_detail_filter_products.setValue('all')
                            plan_detail_filter_types.setValue('all')
                        } else {
                            plan_detail_filter_products.setValue(selected_products)
                            plan_detail_filter_types.setValue(selected_types)
                        }
                    }

                    function onChangeProduct(){
                        selected_products = plan_detail_filter_products.getResult()

                        selected_products.forEach(product_name => {
                            let source_product = main_data.products.filter(p => {return p.name == product_name})[0]
                            let product_category = source_product.category.toUpperCase()
                            let product_raw = source_product.raw.toUpperCase()
                            if (!selected_types.includes(product_category)) {
                                selected_types.push(product_category)
                            }
                            if (!selected_raws.includes(product_raw)) {
                                selected_raws.push(product_raw)
                            }

                        })


                        if (selected_products.length == 0) {
                            plan_detail_filter_raws.setValue('all')
                            plan_detail_filter_types.setValue('all')
                        } else {
                            plan_detail_filter_types.setValue(selected_types)
                            plan_detail_filter_raws.setValue(selected_raws)

                        }
                    }
                }, 100)

            }

            function showBtnPlanningUpdate(){
                document.getElementById("table_planning_comments2").style.display = 'none'
                document.getElementById("table_planning_load").style.display = 'none'
                document.getElementById("table_planning_update").style.display = 'flex'
                this.parentElement.parentElement.parentElement.parentElement.parentElement.classList.add('updated')
            }
        }
    }
    function setPlanningFilters(){
        console.log("data_planning ", data_planning)
        planning_filter_regions.setValue(data_planning.regions)

        document.getElementById('filter_planning_year').innerText   = "Year: " + data_planning.year

        document.getElementById('filter_planning_raf').innerText  = getRafName(data_planning.raf)

        let month_text = "Overview"
        if (data_planning.month != 100) {
            month_text = "Month: " + getMonthName(data_planning.month)
        }
        document.getElementById('filter_planning_month').innerText   = month_text

        let planning_type = 'kg'
        if (data_planning.type == 'value') {
            planning_type = 'usd'
        }
        document.getElementById('filter_planning_type').innerText = "Type: " + planning_type

    }
    document.getElementById('btn_update_planning').addEventListener('click', function (evt) {
        createPlanningTable()
    })


    function setPlanningInfo(info){
        const table = document.getElementById('planning_details_table')
        table.innerHTML = `<div class="row header">
                                 <div class="cell_value name inactive"></div>
                                 <div class="cell_value" data-type="raf0">BUDGET</div>
                                 <div class="cell_diff"  data-type=""></div>
                                 <div class="cell_value" data-type="raf1">RAF I</div>
                                 <div class="cell_diff"  data-type=""></div>
                                 <div class="cell_value" data-type="fact_raf1">FACT</div>
                                 <div class="cell_diff"  data-type=""></div>
                                 <div class="cell_value" data-type="raf2">RAF II</div>
                                 <div class="cell_diff"  data-type=""></div>
                                 <div class="cell_value" data-type="fact_raf2">FACT</div>
                                 <div class="cell_diff"  data-type=""></div>
                                 <div class="cell_value" data-type="raf3">RAF III</div>
                                 <div class="cell_diff"  data-type=""></div>
                                 <div class="cell_value" data-type="fact_raf3">FACT</div>
                                 <div class="cell_diff"  data-type=""></div>
                                 <div class="cell_value" data-type="raf4">RAF IV</div>
                                 <div class="cell_diff"  data-type=""></div>
                                 <div class="cell_value" data-type="fact_raf4">FACT</div>
                            </div>`

        let html = ''
        for (let i = 0; i <= 4; i++ )  {
            let period_name = `q${i + 1}`
            if (i == 4) {period_name = 'year'}

            //period_name = 'q1'
            html += `<div class="row">
                        <div class="cell_value name">${period_name.toUpperCase()}</div>
                        <div class="cell_value" data-id="row_${period_name}" data-type="raf0">${formatNum(info.raf0[`${period_name}`])}</div>
                        <div class="cell_diff"></div>
                        <div class="cell_value" data-id="row_${period_name}" data-type="raf1">${formatNum(info.raf1[`${period_name}`])}</div>
                        <div class="cell_diff"></div>
                        <div class="cell_value" data-id="row_${period_name}" data-type="fact_raf1">${formatNum(info.fact_raf1[`${period_name}`])}</div>
                        <div class="cell_diff"></div>
                        <div class="cell_value" data-id="row_${period_name}" data-type="raf2">${formatNum(info.raf2[`${period_name}`])}</div>
                        <div class="cell_diff"></div>
                        <div class="cell_value" data-id="row_${period_name}" data-type="fact_raf2">${formatNum(info.fact_raf2[`${period_name}`])}</div>
                        <div class="cell_diff"></div>
                        <div class="cell_value" data-id="row_${period_name}" data-type="raf3">${formatNum(info.raf3[`${period_name}`])}</div>
                        <div class="cell_diff"></div>
                        <div class="cell_value" data-id="row_${period_name}" data-type="fact_raf3">${formatNum(info.fact_raf3[`${period_name}`])}</div>
                        <div class="cell_diff"></div>
                        <div class="cell_value" data-id="row_${period_name}" data-type="raf4">${formatNum(info.raf4[`${period_name}`])}</div>
                        <div class="cell_diff"></div>
                        <div class="cell_value" data-id="row_${period_name}" data-type="fact_raf4">${formatNum(info.fact_raf4[`${period_name}`])}</div>

                    </div>`
        }


        table.innerHTML += html

        const inactive_cells = [

            {data_id: "row_q2", data_type: "fact_raf1"},
            {data_id: "row_q3", data_type: "fact_raf1"},
            {data_id: "row_q4", data_type: "fact_raf1"},
            {data_id: "row_q3", data_type: "fact_raf2"},
            {data_id: "row_q4", data_type: "fact_raf2"},
            {data_id: "row_q4", data_type: "fact_raf3"},
            {data_id: "row_q1", data_type: "raf2"},
            {data_id: "row_q1", data_type: "raf3"},
            {data_id: "row_q2", data_type: "raf3"},
            {data_id: "row_q1", data_type: "raf4"},
            {data_id: "row_q2", data_type: "raf4"},
            {data_id: "row_q3", data_type: "raf4"},
        ]

        Array.from(table.querySelectorAll(`.cell_value`)).forEach(function(element) {
            let e_data_id   = element.getAttribute("data-id")
            let e_data_type = element.getAttribute("data-type")

            inactive_cells.forEach(function(inactive_cell) {
                if (inactive_cell.data_id == e_data_id && inactive_cell.data_type == e_data_type ) {
                    element.classList.add("inactive")
                }
            })
        })

        Array.from(table.querySelectorAll(`[data-id="row_year"]`)).forEach(function(element) {
            element.getAttribute("data-type")

            let cell_1 = ''
            let cell_2 = ''
            let cell_3 = ''
            let cell_4 = ''
            switch (element.getAttribute("data-type")) {
                case "raf0":
                    cell_1 = '[data-id="row_q1"][data-type="raf0"]'
                    cell_2 = '[data-id="row_q2"][data-type="raf0"]'
                    cell_3 = '[data-id="row_q3"][data-type="raf0"]'
                    cell_4 = '[data-id="row_q4"][data-type="raf0"]'
                    break;
                case "raf1":
                    cell_1 = '[data-id="row_q1"][data-type="raf1"]'
                    cell_2 = '[data-id="row_q2"][data-type="raf1"]'
                    cell_3 = '[data-id="row_q3"][data-type="raf1"]'
                    cell_4 = '[data-id="row_q4"][data-type="raf1"]'
                    break;
                case "fact_raf1":
                    cell_1 = '[data-id="row_q1"][data-type="fact_raf1"]'
                    cell_2 = '[data-id="row_q2"][data-type="raf1"]'
                    cell_3 = '[data-id="row_q3"][data-type="raf1"]'
                    cell_4 = '[data-id="row_q4"][data-type="raf1"]'
                    break;
                case "raf2":
                    cell_1 = '[data-id="row_q1"][data-type="fact_raf2"]'
                    cell_2 = '[data-id="row_q2"][data-type="raf2"]'
                    cell_3 = '[data-id="row_q3"][data-type="raf2"]'
                    cell_4 = '[data-id="row_q4"][data-type="raf2"]'
                    break;
                case "fact_raf2":
                    cell_1 = '[data-id="row_q1"][data-type="fact_raf2"]'
                    cell_2 = '[data-id="row_q2"][data-type="fact_raf2"]'
                    cell_3 = '[data-id="row_q3"][data-type="raf2"]'
                    cell_4 = '[data-id="row_q4"][data-type="raf2"]'
                    break;
                case "raf3":
                    cell_1 = '[data-id="row_q1"][data-type="fact_raf3"]'
                    cell_2 = '[data-id="row_q2"][data-type="fact_raf3"]'
                    cell_3 = '[data-id="row_q3"][data-type="raf3"]'
                    cell_4 = '[data-id="row_q4"][data-type="raf3"]'
                    break;
                case "fact_raf3":
                    cell_1 = '[data-id="row_q1"][data-type="fact_raf3"]'
                    cell_2 = '[data-id="row_q2"][data-type="fact_raf3"]'
                    cell_3 = '[data-id="row_q3"][data-type="fact_raf3"]'
                    cell_4 = '[data-id="row_q4"][data-type="raf3"]'
                    break;
                case "raf4":
                    cell_1 = '[data-id="row_q1"][data-type="fact_raf4"]'
                    cell_2 = '[data-id="row_q2"][data-type="fact_raf4"]'
                    cell_3 = '[data-id="row_q3"][data-type="fact_raf4"]'
                    cell_4 = '[data-id="row_q4"][data-type="raf4"]'
                    break;
                case "fact_raf4":
                    cell_1 = '[data-id="row_q1"][data-type="fact_raf4"]'
                    cell_2 = '[data-id="row_q2"][data-type="fact_raf4"]'
                    cell_3 = '[data-id="row_q3"][data-type="fact_raf4"]'
                    cell_4 = '[data-id="row_q4"][data-type="fact_raf4"]'
                    break;
            }


            element.onmouseover = function(e) {
                element.classList.add('selected')
                table.querySelector(`.row.header [data-type="${element.getAttribute("data-type")}"]`).classList.add('selected')
                table.querySelector(cell_1).classList.add('selected')
                table.querySelector(cell_2).classList.add('selected')
                table.querySelector(cell_3).classList.add('selected')
                table.querySelector(cell_4).classList.add('selected')
            }
            element.onmouseout  = function(e) {
                element.classList.remove('selected')
                table.querySelector(`.row.header [data-type="${element.getAttribute("data-type")}"]`).classList.remove('selected')
                table.querySelector(cell_1).classList.remove('selected')
                table.querySelector(cell_2).classList.remove('selected')
                table.querySelector(cell_3).classList.remove('selected')
                table.querySelector(cell_4).classList.remove('selected')
            }
        })
    }
    document.getElementById('btn_planning_details').addEventListener('click', function (evt) {
        const table = document.getElementById('div_planning_details_table')

        console.log("table.style.display ", table.style.display)
        if (table.style.display === 'none' || table.style.display == '') {
            table.style.display = 'block'
        } else {
            table.style.display = 'none'
        }
    });
    document.getElementById('btn_close_planning').addEventListener('click', () => { document.getElementById("div_planning_details_table").style.display = 'none' }  )

    async function createPlanningTable() {
        const btn = document.getElementById('btn_update_planning')
        const text = document.getElementById('text_planning_filter')
        btn.style.display = 'none'
        text.style.display = 'block'

        let data = {
            russiacis: {
                name: "RU+",
                current: {
                    total: 1,
                    q1: {tons: 0, price: 0, total: 0},
                    q2: {tons: 0, price: 0, total: 0},
                    q3: {tons: 0, price: 0, total: 0},
                    q4: {tons: 0, price: 0, total: 0},
                },
                prev: {
                    total: 1,
                    q1: {tons: 0, price: 0, total: 0},
                    q2: {tons: 0, price: 0, total: 0},
                    q3: {tons: 0, price: 0, total: 0},
                    q4: {tons: 0, price: 0, total: 0},
                },

                companies: [
                    {name: "SOT",
                        current: {
                            total: 1,
                            q1: {tons: 0, price: 0, total: 0},
                            q2: {tons: 0, price: 0, total: 0},
                            q3: {tons: 0, price: 0, total: 0},
                            q4: {tons: 0, price: 0, total: 0},
                        },
                        prev: {
                            total: 1,
                            q1: {tons: 0, price: 0, total: 0},
                            q2: {tons: 0, price: 0, total: 0},
                            q3: {tons: 0, price: 0, total: 0},
                            q4: {tons: 0, price: 0, total: 0},
                        },

                        products: [
                            {name: "APC200",
                                total: 0,
                                current: {
                                    total: 1,
                                    q1: {tons: 0, price: 0, total: 0, comment: ''},
                                    q2: {tons: 0, price: 0, total: 0, comment: ''},
                                    q3: {tons: 0, price: 0, total: 0, comment: ''},
                                    q4: {tons: 0, price: 0, total: 0, comment: ''},
                                },
                                prev: {
                                    total: 1,
                                    q1: {tons: 0, price: 0, total: 0},
                                    q2: {tons: 0, price: 0, total: 0},
                                    q3: {tons: 0, price: 0, total: 0},
                                    q4: {tons: 0, price: 0, total: 0},
                                },
                            },

                        ]
                    }
                ],
            },
            //eu: {},
            //mea: {},
            //apac: {},
            //americas: {},
        }


        const table = document.getElementById('table_planning_value')

        let filter = {
            regions: data_planning.regions,
            period:  'year',
            year:    data_planning.year,
            quarter: null ,
            month:   null,
            raf:     data_planning.raf,
            product: main_data.products.map(p => p.name),
            company: main_data.buyers.map(b => b.name)
        }

        table.innerHTML = ''

        filter.company = main_data.buyers.filter(b => {return data_planning.regions.includes(b.region) }).map(b => b.name)

        sendRequest('post', 'get_planning_info', filter)
            .then(data => {
                document.getElementById('table_planning').style.display = "table"

                //let source_data = JSON.parse(JSON.stringify(data))
                console.log("data_planning.regions ", data_planning.regions)

                let has_empty_products = false
                let empty_row = ''
                let table_data = ''
                for (const [region, region_value] of Object.entries(data.planning)) {
                    console.log("region_value ", region_value)
                    console.log("region_value 2 ", !data_planning.regions.includes(region))

                    if (region_value.name == "SUM") {
                        continue
                    }

                    if (!data_planning.regions.includes(region)) {
                        continue
                    }


                    if (typeof region_value.current != 'undefined' && region_value.current.total != 0 && region_value.prev.total != 0 ) {

                        table_data += '<tr class="region_divider"></tr>'
                        table_data += getPlanningRow(region_value, 'region', '', '')
                        for (const [company, company_value] of Object.entries(region_value.companies)) {
                            table_data += getPlanningRow(company_value, 'company', '', region_value.name)
                            has_empty_products = false
                            for (const [product, product_value] of Object.entries(company_value.products)) {
                                if (product_value.current.year.tons == 0 && product_value.prev.year.tons == 0 ) {
                                    if (has_empty_products == false) {
                                        has_empty_products = true
                                        empty_row = getPlanningRow(getPlanningEmptyData(), 'empty', company_value.name, region_value.name )
                                    }
                                    table_data += getPlanningRow(product_value, 'product', company_value.name, region_value.name )

                                } else {
                                    table_data += getPlanningRow(product_value, 'product', company_value.name, region_value.name )
                                }
                            }
                            table_data += empty_row
                            empty_row = ''

                        }
                    }
                }

                table_data += '<tr class="region_divider"></tr>'
                table_data += getPlanningRow(data.planning.SUM, 'SUM', '', '')


                table.innerHTML = table_data

                Array.from(table.querySelectorAll(".input_plan_volume, .input_plan_price")).forEach(function(element) {
                    element.addEventListener('input', changePlanValue );
                });
                Array.from(table.querySelectorAll(".btn_save_planning_changes")).forEach(function(element) {
                    element.addEventListener('click', savePlanningChanges );
                });
                Array.from(table.querySelectorAll(".show_plan_comment")).forEach(function(element) {
                    element.addEventListener('click', showPlanDetails );
                });
                Array.from(table.querySelectorAll(".planning_show_company_products")).forEach(function(element) {
                    element.addEventListener('click', showCompanyProductsPlan );
                });
                Array.from(table.querySelectorAll(".planning_show_region_companies")).forEach(function(element) {
                    element.addEventListener('click', showRegionCompaniesPlan );
                });
                Array.from(table.querySelectorAll(".show_all_products")).forEach(function(element) {
                    element.addEventListener('click', showCompaniesAllProducts );
                });

                Array.from(table.querySelectorAll(".type_product")).forEach(function(element) {
                    element.style.display = 'none'
                });
                Array.from(table.querySelectorAll(".type_company")).forEach(function(element) {
                    element.style.display = 'none'
                });

                tippy('.planning_company_name, .btn_save_planning_changes, .show_plan_comment', {
                    followCursor: 'horizontal',
                    animation: 'fade',
                });

                btn.style.display = 'none'
                text.style.display = 'none'
                data_planning.headers = data.headers
                changePlanningTable()
                setPlanningInfo(data.planning_info)
            })
            .catch(err => console.log(err))
    }
    function changePlanningTable(){

        setPlanningHeaders()


        let header_1_col_span = 0
        let header_2_col_span = 0
        if (data_planning.month == 100) {
            header_1_col_span = 4
            header_2_col_span = 1

            Array.from(document.querySelectorAll(".planning_column")).forEach(function(element) {

                element.style.display = 'none'

                if (element.classList.contains('no_hide')) {
                    element.style.display = 'table-cell'
                }
                if (element.getAttribute("data-type") == data_planning.type && element.hasAttribute("data-quarter") ) {
                    element.style.display = 'table-cell'
                }

            });


            Array.from(document.querySelectorAll(".planning_header_2")).forEach(function(element) {
                element.style.display = 'none'
                element.colSpan = header_2_col_span

                if (element.hasAttribute("data-quarter")) {
                    element.style.display = 'table-cell'
                }

                if (parseInt(element.getAttribute("data-quarter")) == 10) {
                    element.colSpan = 1
                }
            })


        } else {
            header_1_col_span = 3
            header_2_col_span = 3

            Array.from(document.querySelectorAll(".planning_header_2")).forEach(function(element) {
                element.style.display = 'none'
                element.colSpan = header_2_col_span
                if (element.hasAttribute("data-month") && parseInt(element.getAttribute("data-month")) == data_planning.month) {
                    element.style.display = 'table-cell'
                }
                if (element.hasAttribute("data-quarter") && parseInt(element.getAttribute("data-quarter")) == 10) {
                    element.style.display = 'table-cell'
                    element.colSpan = 1
                }


            })

            Array.from(document.querySelectorAll(".planning_column")).forEach(function(element) {
                element.style.display = 'none'
                if (element.hasAttribute("data-month")){
                    if (parseInt(element.getAttribute("data-month")) === data_planning.month) {
                        element.style.display = 'table-cell'
                    }
                }
                if (element.classList.contains('no_hide')) {
                    element.style.display = 'table-cell'
                }

                if (element.hasAttribute("data-quarter") && parseInt(element.getAttribute("data-quarter")) == 10) {
                    if (element.getAttribute("data-type") == data_planning.type){
                        element.style.display = 'table-cell'
                    }
                }

                //if (parseInt(element.getAttribute("data-month")) === 100 ) {
                //    if (element.getAttribute("data-type") == data_planning.type) {
                //        element.style.display = 'table-cell'
                //    }
                //    if (element.classList.contains('no_hide')) {
                //        element.style.display = 'table-cell'
                //    }
                //}
            });
        }


        //Array.from(document.querySelectorAll(".planning_header_2")).forEach(function(element) {
        //    element.colSpan = header_2_col_span
        //    if (parseInt(element.getAttribute("data-quarter")) == 10) {
        //        element.colSpan = 1
        //    }
        //})

        //Array.from(document.querySelectorAll(".planning_column")).forEach(function(element) {
//
//
        //    element.style.display = 'none'
//
//
        //    if (data_planning.month == 100) { // Тут мы видем все данные сразу
//
        //        if (element.classList.contains('no_hide')) {
        //            element.style.display = 'table-cell'
        //        }
        //        if (element.getAttribute("data-type") == data_planning.type) {
        //            element.style.display = 'table-cell'
        //        }
        //        Array.from(document.querySelectorAll(".planning_header_2")).forEach(function(element) {
        //            element.style.display = 'table-cell'
        //        })
//
//
        //    } else {
//
//
        //        if (parseInt(element.getAttribute("data-month")) === data_planning.month) {
        //            element.style.display = 'table-cell'
        //        }
        //        if (parseInt(element.getAttribute("data-month")) === 100 ) {
        //            if (element.getAttribute("data-type") == data_planning.type) {
        //                element.style.display = 'table-cell'
        //            }
        //            if (element.classList.contains('no_hide')) {
        //                element.style.display = 'table-cell'
        //            }
        //        }
        //    }
        //});

        Array.from(document.querySelectorAll(".planning_header_1")).forEach(function(element) {
            element.colSpan = header_1_col_span
            if (element.classList.contains('center')) {
                element.colSpan = 3
            }
            //if (parseInt(element.getAttribute("data-quarter")) == 10){
            //    if (data_planning.month == 100) {
            //        element.colSpan = 3
            //    } else {
            //        element.colSpan = 4
            //    }
            //}
        })
    }
    function setPlanningHeaders(){
        //console.log("headers ", data_planning.headers)
        Array.from(document.getElementById('table_planning_head').getElementsByClassName("planning_header_2")).forEach(function(element) {
            //  console.log("element ", element)

            if (element.hasAttribute("data-quarter")){
                let text = ''
                const quarter = parseInt(element.getAttribute("data-quarter"))
                if (quarter == 10) {
                    text = data_planning.headers[`header_${element.getAttribute("data-period")}`].year
                } else {
                    text = `Q${quarter} ` + data_planning.headers[`header_${element.getAttribute("data-period")}`][`q${quarter}`]
                }
                element.innerText = text
            } else {

                let text = ''
                const month = parseInt(element.getAttribute("data-month"))
                if (month == 100) {
                    text = data_planning.headers[`header_${element.getAttribute("data-period")}`].year
                } else {
                    text = `${getMonthName(month)} ` + data_planning.headers[`header_${element.getAttribute("data-period")}`][`m${month}`]
                }
                element.innerText = text
            }


        })

        document.getElementById('table_planning_head').style.display = "table-header-group"
    }
    function getPlanningRow(data, row_type, company, region){

        let extra_row_class = ''
        let data_company = ''
        let data_region = ''
        let name = data.name

        extra_row_class += `type_${row_type}`
        if (row_type == 'company') {
            company = data.name
        }

        if (row_type == 'region' ) {
            region  = data.name
        }


        if (row_type == 'SUM') {
            name = `<div class="planning_total_name"">
                        TOTAL
                    </div>`
        }

        if (row_type == 'region') {
            name = `<div class="planning_region_name" data-tippy-content="${data.region}">
                        <img src="img/arrow_down.svg" class="planning_show_region_companies"/>
                        <img src="img/info_blue.svg" data-tippy-content="Show detail info" class="show_plan_comment"/>
                        ${data.name}
                    </div>`
        }


        let company_name = data.name
        if (row_type == 'company') {

            if (company_name.length > 16){
                company_name = company_name.substring(0,15) + "..."
            }

            name = `<div class="planning_company_name" data-tippy-content="${data.name}">
                        <img src="img/arrow_down.svg" class="planning_show_company_products"/>
                        <img src="img/info_blue.svg" data-tippy-content="Show detail info" class="show_plan_comment"/>
                        ${company_name}
                    </div>`
        }

        let product_name = data.name
        if (row_type == 'product') {

            if (product_name.length > 12){
                product_name = product_name.substring(0,11) + "..."
            }

            name = `<div class="planning_product_name" data-tippy-content="${data.name}">
                        <img src="img/info.svg" data-tippy-content="Show detail info" class="show_plan_comment"/>
                        ${product_name}
                    </div>`
        }

        if (row_type == 'empty') {
            extra_row_class = `type_product`
            name = `<div class="planning_product_name show_all_products"><img src="img/show.svg" data-tippy-content="Show all products" class=""/>Show all</div>`

        }



        let row_q1 = ''
        let row_q2 = ''
        let row_q3 = ''
        let row_q4 = ''
        let row_year = ''
        let rows_data = {
            prev: {q1: '', q2: '', q3: '', q4: '', m1: '', m2: '', m3: '', m4: '', m5: '', m6: '', m7: '', m8: '', m9: '', m10: '', m11: '', m12: '' },

            current: {q1: '', q2: '', q3: '', q4: '', m1: '', m2: '', m3: '', m4: '', m5: '', m6: '', m7: '', m8: '', m9: '', m10: '', m11: '', m12: '' } }

        for (let i = 1; i <= 4; i++) {
            //let tons          = data.current[`q${i}`].tons == 0 ? "" : data.current[`q${i}`].tons
            //let current_tons  = `<input class="input_plan_volume"   data-quarter="${i}" type="number" value="${tons}" placeholder="0"   data-prev="${data.current[`q${i}`].tons}"/>`
            //let price         = data.current[`q${i}`].price == 0 ? "" : data.current[`q${i}`].price
            //let current_price = `<input class="input_plan_price"   data-quarter="${i}" type="number" value="${price}" placeholder="0"   data-prev="${data.current[`q${i}`].price}"/>`
            //let prev_price = `${data.prev[`q${i}`].price}`

            let current_tons = ''
            let current_price = ''
            let prev_price = ''
            let comment = ``

            if (row_type == 'region' || row_type == 'company' || row_type == 'SUM') {
                current_tons  = formatNum(data.current[`q${i}`].tons, true)
                current_price = ''

            } else {
                current_tons  = formatNum(data.current[`q${i}`].tons, true)
                current_price = data.current[`q${i}`].price
            }

            if (i < data_planning.raf) {
                current_tons  = formatNum(data.current[`q${i}`].tons, true)
                current_price = data.current[`q${i}`].price
                comment = ''
            }



            let tons_style = ''
            if (i == 1) {tons_style = 'current_left_cell'}
            if (i == 4) {tons_style = 'current_right_cell'}
            let cash_style = ''
            if (i == 1) {cash_style = 'current_left_cell'}
            if (i == 4) {cash_style = 'current_right_cell'}

            let row_prev = `
                        <td  data-quarter="${i}" data-type="volume" class="planning_column text_right prev_tons">${formatNum(data.prev[`q${i}`].tons, true)}</td>
                        <td  data-quarter="${i}"                    class="planning_column text_right prev_price">${prev_price}</td>
                        <td  data-quarter="${i}" data-type="value"  class="planning_column text_right prev_cash">${formatNum(data.prev[`q${i}`].total, true)}</td>`
            let row_current = `
                        <td  data-quarter="${i}" data-type="volume"  class="planning_column text_right current_color current_tons ${tons_style} " data-comment="${data.current[`q${i}`].comment}">${current_tons}</td>
                        <td  data-quarter="${i}"                     class="planning_column text_right current_color">${current_price}</td>
                        <td  data-quarter="${i}" data-type="value"   class="planning_column text_right current_color current_cash ${cash_style} ">${formatNum(data.current[`q${i}`].total, true)}</td>`
            rows_data.prev[`q${i}`] = row_prev
            rows_data.current[`q${i}`] = row_current

        }
        for (let i = 1; i <= 12; i++) {
            let tons      = data.current[`m${i}`].tons == 0 ? "" : data.current[`m${i}`].tons
            let current_tons  = `<input class="input_plan_volume"   data-month="${i}" type="number" value="${tons}" placeholder="0"   data-prev="${data.current[`m${i}`].tons}"/>`


            let price             = data.current[`m${i}`].price == 0 ? "" : data.current[`m${i}`].price

            let price_placeholder = ''
            if (row_type == 'product') {
                price_placeholder = data.current[`m${i}`].price == 0 ? main_data.products.filter(function(item, i) {return item.name == data.name})[0].base_price : data.current[`m${i}`].price
            }
            let current_price  = `<input class="input_plan_price"   data-month="${i}" type="number" value="${price}" placeholder="${price_placeholder}"   data-prev="${data.current[`m${i}`].price}"/>`


            let prev_price = `${data.prev[`m${i}`].price}`
            if (prev_price == '0') {prev_price = ''}

            let comment = ``

            if (row_type == 'region' || row_type == 'company' || row_type == 'SUM') {
                current_tons  = formatNum(data.current[`m${i}`].tons, true)
                current_price = ''
                prev_price = ''
            }

            if (i < data_planning.raf) {
                current_tons  = formatNum(data.current[`m${i}`].tons, true)
                current_price = data.current[`m${i}`].price
                comment = ''
            }

            let row_prev = `
                        <td  data-month="${i}" data-type="volume" class="planning_column text_right prev_tons">${formatNum(data.prev[`m${i}`].tons, true)}</td>
                        <td  data-month="${i}"                    class="planning_column text_right prev_price">${prev_price}</td>
                        <td  data-month="${i}" data-type="value"  class="planning_column text_right prev_cash">${formatNum(data.prev[`m${i}`].total, true)}</td>`
            let row_current = `
                        <td  data-month="${i}" data-type="volume"  class="planning_column text_right current_color current_tons current_left_cell" data-comment="${data.current[`m${i}`].comment}">${current_tons}</td>
                        <td  data-month="${i}"                     class="planning_column text_right current_color ">${current_price}</td>
                        <td  data-month="${i}" data-type="value"   class="planning_column text_right current_color current_cash current_right_cell">
                            <div class="div_in_table">
                                <img class="btn_save_planning_changes" data-month="${i}" src="img/save_small.svg" data-tippy-content="Save changes"/>

                                <div class="current_cash_value"        data-month="${i}"> ${formatNum(data.current[`m${i}`].total, true)} </div>
                            </div>
                        </td>`
            rows_data.prev[`m${i}`] = row_prev
            rows_data.current[`m${i}`] = row_current

        }


        let diff_volume_html = ``
        let diff_value_html = ``
        let diff_volume = getDiff(data.current.year.tons, data.prev.year.tons)
        let diff_value  = getDiff(data.current.year.total, data.prev.year.total)

        let display_diff_icon = 'none'
        if (data.has_comment) {
            display_diff_icon = 'inline'
        }
        diff_volume_html = `<span>${diff_volume} </span>`
        diff_value_html  = `<span>${diff_value}  </span>`

        if (diff_volume == -100) {
            diff_volume_html = `<span></span><img src="img/info.svg" class="show_plan_comment" style="display: ${display_diff_icon}"/>`
            diff_value_html  = `<span></span><img src="img/info.svg" class="show_plan_comment" style="display: ${display_diff_icon}"/>`
        }

        row_year += `   <td class="table_separator"></td>
                        <td  data-quarter="10" data-type="volume" class="planning_column text_right prev_tons">${formatNum(data.prev.year.tons, true)}</td>
                        <td  data-quarter="10" data-type="value"  class="planning_column text_right prev_cash">${formatNum(data.prev.year.total, true)}</td>
                        <td  data-quarter="10" data-type="volume" class="planning_column text_right diff">${diff_volume_html}</td>
                        <td  data-quarter="10" data-type="value"  class="planning_column text_right diff">${diff_value_html}</td>
                        <td  data-quarter="10" data-type="volume" class="planning_column text_right current_tons">${formatNum(data.current.year.tons, true)}</td>
                        <td  data-quarter="10" data-type="value"  class="planning_column text_right current_cash">${formatNum(data.current.year.total, true)}</td>
                        <td class="table_separator"></td>`



        let display_class = ''
        if (data.current.year.tons === 0 && data.prev.year.tons === 0) {
            if (row_type == 'product' && row_type != 'empty') {
                display_class = 'hidden_row'
            }
        }

        let table_data = ` <tr class="spg_table_row ${extra_row_class} ${display_class}"
                                data-product="${data.name}"
                                data-company="${company}"
                                data-region="${region}"
                            >

                               <td class="name">
                                   <span>${name}</span>
                               </td>
                               <td class="table_separator"></td>`


        table_data += `${rows_data.prev.q1}${rows_data.prev.q2}${rows_data.prev.q3}${rows_data.prev.q4}
                       ${rows_data.prev.m1}${rows_data.prev.m2}${rows_data.prev.m3}${rows_data.prev.m4}
                       ${rows_data.prev.m5}${rows_data.prev.m6}${rows_data.prev.m7}${rows_data.prev.m8}
                       ${rows_data.prev.m9}${rows_data.prev.m10}${rows_data.prev.m11}${rows_data.prev.m12}
                       ${row_year}
                       ${rows_data.current.q1}${rows_data.current.q2}${rows_data.current.q3}${rows_data.current.q4}

                       ${rows_data.current.m1}${rows_data.current.m2}${rows_data.current.m3}${rows_data.current.m4}
                       ${rows_data.current.m5}${rows_data.current.m6}${rows_data.current.m7}${rows_data.current.m8}
                       ${rows_data.current.m9}${rows_data.current.m10}${rows_data.current.m11}${rows_data.current.m12}
                       `
        table_data += `</tr>`

        return table_data
    }
    function getPlanningEmptyData(){

        let data = {
            name: "APC167B",
            total: 325050,
            has_comment: false,
            current: {
                m1:   {tons: 0, price: 0, total: 0, comment: ""},
                m2:   {tons: 0, price: 0, total: 0, comment: ""},
                m3:   {tons: 0, price: 0, total: 0, comment: ""},
                m4:   {tons: 0, price: 0, total: 0, comment: ""},
                m5:   {tons: 0, price: 0, total: 0, comment: ""},
                m6:   {tons: 0, price: 0, total: 0, comment: ""},
                m7:   {tons: 0, price: 0, total: 0, comment: ""},
                m8:   {tons: 0, price: 0, total: 0, comment: ""},
                m9:   {tons: 0, price: 0, total: 0, comment: ""},
                m10:  {tons: 0, price: 0, total: 0, comment: ""},
                m11:  {tons: 0, price: 0, total: 0, comment: ""},
                m12:  {tons: 0, price: 0, total: 0, comment: ""},
                q1:   {tons: 0, price: 0, total: 0, comment: ""},
                q2:   {tons: 0, price: 0, total: 0, comment: ""},
                q3:   {tons: 0, price: 0, total: 0, comment: ""},
                q4:   {tons: 0, price: 0, total: 0, comment: ""},
                year: {tons: 0, price: 0, total: 0, comment: ""}
            },
            prev: {
                m1:   {tons: 0, price: 0, total: 0, comment: ""},
                m2:   {tons: 0, price: 0, total: 0, comment: ""},
                m3:   {tons: 0, price: 0, total: 0, comment: ""},
                m4:   {tons: 0, price: 0, total: 0, comment: ""},
                m5:   {tons: 0, price: 0, total: 0, comment: ""},
                m6:   {tons: 0, price: 0, total: 0, comment: ""},
                m7:   {tons: 0, price: 0, total: 0, comment: ""},
                m8:   {tons: 0, price: 0, total: 0, comment: ""},
                m9:   {tons: 0, price: 0, total: 0, comment: ""},
                m10:  {tons: 0, price: 0, total: 0, comment: ""},
                m11:  {tons: 0, price: 0, total: 0, comment: ""},
                m12:  {tons: 0, price: 0, total: 0, comment: ""},
                q1:   {tons: 0, price: 0, total: 0, comment: ""},
                q2:   {tons: 0, price: 0, total: 0, comment: ""},
                q3:   {tons: 0, price: 0, total: 0, comment: ""},
                q4:   {tons: 0, price: 0, total: 0, comment: ""},
                year: {tons: 0, price: 0, total: 0, comment: ""}
            }

        }


        return data
    }

    function showRegionCompaniesPlan(){

        const parent = this.parentElement.parentElement.parentElement.parentElement
        const table = parent.parentElement
        const show_region_products = parent.getAttribute("data-region")

        let current_visible = null

        let current = this
        Array.from(table.querySelectorAll(".planning_show_region_companies")).forEach(function(element) {
            console.log("this ", current)
            console.log("element ", element)
            console.log("== ", current == element)
            if (current == element) {
                if (current.style.transform == 'rotate(180deg)') {
                    current.style.transform = 'rotate(0deg)';
                } else {
                    current.style.transform = 'rotate(180deg)';
                }
            } else {
                element.style.transform = 'rotate(0deg)';
            }
        })
        //this.style.transform = 'rotate(180deg)';

        Array.from(table.querySelectorAll(".planning_show_company_products")).forEach(function(element) {
            element.style.transform = 'rotate(0deg)';
        })

        //console.log("this.style.transform ", this.style.transform)
        //if (this.style.transform == 'rotate(180deg)') {
        //    this.style.transform = 'rotate(0deg)';
        //} else {
        //    this.style.transform = 'rotate(180deg)';
        //}


        Array.from(table.querySelectorAll(".type_company")).forEach(function(element) {
            const el_company = element.getAttribute("data-region")

            console.log("element.style.display ", element.style.display)
            if (current_visible == null && el_company == show_region_products) {
                current_visible = element.style.display == 'table-row'
            }
            element.style.display = 'none'

            if (el_company == show_region_products) {

                if (!current_visible) {
                    element.style.display = 'table-row'
                }

            }

        });

        Array.from(table.querySelectorAll(".type_product")).forEach(function(element) {
            element.style.display = 'none'
        });
    }
    function showCompanyProductsPlan(){

        const parent = this.parentElement.parentElement.parentElement.parentElement
        const table = parent.parentElement
        const show_company_product = parent.getAttribute("data-company")

        let current_visible = null


        let current = this
        Array.from(table.querySelectorAll(".planning_show_company_products")).forEach(function(element) {

            if (current == element) {
                if (current.style.transform == 'rotate(180deg)') {
                    current.style.transform = 'rotate(0deg)';
                } else {
                    current.style.transform = 'rotate(180deg)';
                }
            } else {
                element.style.transform = 'rotate(0deg)';
            }
        })


        //console.log("this.style.transform ", this.style.transform)
        //if (this.style.transform == 'rotate(180deg)') {
        //    this.style.transform = 'rotate(0deg)';
        //} else {
        //    this.style.transform = 'rotate(180deg)';
        //}


        Array.from(table.querySelectorAll(".type_product")).forEach(function(element) {
            const el_company = element.getAttribute("data-company")

            console.log("element.style.display ", element.style.display)
            if (current_visible == null && el_company == show_company_product) {
                current_visible = element.style.display == 'table-row'
            }
            element.style.display = 'none'

            if (el_company == show_company_product) {

                if (!current_visible) {
                    element.style.display = 'table-row'
                }

            }

        });
    }
    function showCompaniesAllProducts(){
        const parent = this.parentElement.parentElement.parentElement
        const table = parent.parentElement
        const company = parent.getAttribute("data-company")


        Array.from(table.querySelectorAll(`.type_product[data-company="${company}"]`)).forEach(function(element) {
            element.classList.remove('hidden_row')
        });

        parent.classList.add('hidden_row')

    }

    function changePlanValue(event){
        const parent  = this.parentElement.parentElement
        const table  = parent.parentElement
        const month = this.getAttribute("data-month")
        const company = parent.getAttribute("data-company")
        const region  = parent.getAttribute("data-region")

        this.classList.add('updated')

        const volume_element = parent.querySelectorAll(`.input_plan_volume[data-month="${month}"]`)[0]
        const price_element  = parent.querySelectorAll(`.input_plan_price[data-month="${month}"]`)[0]
        // Собираем значения с полей
        let volume = volume_element.value
        let price  = price_element.value.replace(",", ".")

        if (volume == '') {
            volume_element.setAttribute("data-prev", 0)
            //volume_element.value = 0
            volume = 0
        }
        if (price == '') {
            price = parseFloat(price_element.placeholder)
            price_element.value = price
            price_element.classList.add('updated')
            price_element.setAttribute("data-prev", price)
        }

        const product_new_tons = parseInt(volume )
        let product_old_tons   = parseInt(volume_element.getAttribute("data-prev"))
        volume_element.setAttribute("data-prev", product_new_tons)

        const product_new_cash = parseInt(volume * price)
        let product_old_cash = parseInt(parent.querySelectorAll(`.current_cash[data-month="${month}"]`)[0].innerText.replace(/ /g,''))
        if (isNaN(product_old_cash)) { product_old_cash = 0}

        console.log(`product_new_tons ${product_new_tons}  product_new_cash ${product_new_cash}` )
        console.log(`product_old_tons ${product_old_tons}  product_old_cash ${product_old_cash}` )


        //Устанавливаем новое значение выручки на месяц продукта
        parent.querySelectorAll(`.current_cash_value[data-month="${month}"]`)[0].innerText = formatNum(product_new_cash)

        //Устанавливаем новое значение выручки на квартал продукта


        let product_quarter_cash_old = parseInt(parent.querySelectorAll(`.current_cash[data-quarter="${getQuarter(month)}"]`)[0].innerText.replace(/ /g,''))
        if (isNaN(product_quarter_cash_old)) {product_quarter_cash_old = 0}
        const product_quarter_cash_cell = parent.querySelectorAll(`.current_cash[data-quarter="${getQuarter(month)}"]`)[0]
        let product_quarter_cash_new = product_quarter_cash_old + (product_new_cash - product_old_cash)
        if (product_quarter_cash_old < 10 && product_new_tons == 0) {product_quarter_cash_new = 0}

        product_quarter_cash_cell.innerHTML  = formatNum(product_quarter_cash_new)


        //Устанавливаем новое значение выручки на год продукта
        let product_year_cash_old = parseInt(parent.querySelectorAll(`.current_cash[data-quarter="10"]`)[0].innerText.replace(/ /g,''))
        if (isNaN(product_year_cash_old)) {product_year_cash_old = 0}
        const product_year_cash_cell = parent.querySelectorAll(`.current_cash[data-quarter="10"]`)[0]
        let product_year_cash_new = product_year_cash_old + (product_new_cash - product_old_cash)
        if (product_year_cash_old < 10 && product_new_tons == 0) {product_year_cash_new = 0}
        product_year_cash_cell.innerHTML  = formatNum(product_year_cash_new)

        let product_year_cash_prev = parent.querySelectorAll(`.prev_cash[data-quarter="10"]`)[0].innerText.replace(/ /g,'').replace('%','')
        if (isNaN(product_year_cash_prev)) {product_year_cash_prev = 0}
        let diff_cash =  getDiff(product_year_cash_new, product_year_cash_prev)
        const diff_product_cash_cell = parent.querySelectorAll(`.diff[data-quarter="10"][data-type="value"]`)[0].firstChild
        diff_product_cash_cell.innerHTML = `${diff_cash}`


        //Устанавливаем новое значение тон на квартал продукта
        let product_quarter_tons_old  = parseInt(parent.querySelectorAll(`.current_tons[data-quarter="${getQuarter(month)}"]`)[0].innerText.replace(/ /g,''))
        if (isNaN(product_quarter_tons_old)) {product_quarter_tons_old = 0}
        const product_quarter_tons_cell = parent.querySelectorAll(`.current_tons[data-quarter="${getQuarter(month)}"]`)[0]
        let product_quarter_tons_new = product_quarter_tons_old + (product_new_tons - product_old_tons)
        if (product_quarter_tons_old < 10 && product_new_tons == 0) {product_quarter_tons_new = 0}
        product_quarter_tons_cell.innerHTML =  formatNum(product_quarter_tons_new)

        //Устанавливаем новое значение тон на год продукта
        let product_year_tons_old  = parseInt(parent.querySelectorAll(`.current_tons[data-quarter="10"]`)[0].innerText.replace(/ /g,''))
        if (isNaN(product_year_tons_old)) {product_year_tons_old = 0}
        const product_year_tons_cell = parent.querySelectorAll(`.current_tons[data-quarter="10"]`)[0]
        let product_year_tons_new = product_year_tons_old + (product_new_tons - product_old_tons)
        if (product_year_tons_old < 10 && product_new_tons == 0) {product_year_tons_new = 0}
        product_year_tons_cell.innerHTML =  formatNum(product_year_tons_new)

        let product_year_tons_prev = parent.querySelectorAll(`.prev_tons[data-quarter="10"]`)[0].innerText.replace(/ /g,'').replace('%','')
        if (isNaN(product_year_tons_prev)) {product_year_tons_prev = 0}
        let diff_tons =  getDiff(product_year_tons_new, product_year_tons_prev)
        const diff_product_tons_cell = parent.querySelectorAll(`.diff[data-quarter="10"][data-type="volume"]`)[0].firstChild
        diff_product_tons_cell.innerHTML = `${diff_tons}`







        //КОМПАНИЯ
        const company_row = table.querySelectorAll(`.type_company[data-company="${company}"]`)[0]
        let company_quarter_cash_old  = parseInt(company_row.querySelectorAll(`.current_cash[data-month="${month}"]`)[0].innerText.replace(/ /g,''))
        if (isNaN(company_quarter_cash_old)) {
            company_quarter_cash_old = 0
        }

        //Устанавливаем новое значение выручки на месяц компании
        const company_month_cash_new  = company_quarter_cash_old + (product_new_cash - product_old_cash)
        const company_month_cash_cell = company_row.querySelectorAll(`.current_cash[data-month="${month}"]`)[0]
        company_month_cash_cell.innerText = formatNum(company_month_cash_new)


        //Устанавливаем новое значение выручки на квартал компании
        const company_quarter_old_value = parseInt(company_row.querySelectorAll(`.current_cash[data-quarter="${getQuarter(month)}"]`)[0].innerText.replace(/ /g,''))
        const company_quarter_cell = company_row.querySelectorAll(`.current_cash[data-quarter="${getQuarter(month)}"]`)[0]
        const company_quarter_cash_new = company_quarter_old_value + (product_new_cash - product_old_cash)
        company_quarter_cell.innerText = formatNum(company_quarter_cash_new)

        //Устанавливаем новое значение выручки на год компании
        const company_year_old_value = parseInt(company_row.querySelectorAll(`.current_cash[data-quarter="10"]`)[0].innerText.replace(/ /g,''))
        const company_year_cell = company_row.querySelectorAll(`.current_cash[data-quarter="10"]`)[0]
        const company_year_cash_new = company_year_old_value + (product_new_cash - product_old_cash)
        company_year_cell.innerText = formatNum(company_year_cash_new)

        diff_cash =  getDiff(company_year_cash_new, company_row.querySelectorAll(`.prev_cash[data-quarter="10"]`)[0].innerText)
        const diff_company_cash_cell = company_row.querySelectorAll(`.diff[data-quarter="10"][data-type="value"]`)[0]
        diff_company_cash_cell.innerHTML = `${diff_cash}`


        // базовые значения по тоннам компании
        let company_month_tons_old  = parseInt(company_row.querySelectorAll(`.current_tons[data-month="${month}"]`)[0].innerText.replace(/ /g,''))
        if (isNaN(company_month_tons_old)) {
            company_month_tons_old = 0
        }

        //Устанавливаем новое значение тонн на месяц компании
        const company_month_tons_new  = company_month_tons_old + (product_new_tons - product_old_tons)
        const company_month_tons_cell = company_row.querySelectorAll(`.current_tons[data-month="${month}"]`)[0]
        company_month_tons_cell.innerText = formatNum(company_month_tons_new)

        //Устанавливаем новое значение тонн на квартал компании
        const company_quarter_tons_old = parseInt(company_row.querySelectorAll(`.current_tons[data-quarter="${getQuarter(month)}"]`)[0].innerText.replace(/ /g,''))
        const company_quarter_tons_new_cell = company_row.querySelectorAll(`.current_tons[data-quarter="${getQuarter(month)}"]`)[0]
        const company_quarter_tons_new = company_quarter_tons_old + (product_new_tons - product_old_tons)
        company_quarter_tons_new_cell.innerText = formatNum(company_quarter_tons_new)

        //Устанавливаем новое значение тонн на год компании
        const company_year_tons_old = parseInt(company_row.querySelectorAll(`.current_tons[data-quarter="10"]`)[0].innerText.replace(/ /g,''))
        const company_year_tons_new_cell = company_row.querySelectorAll(`.current_tons[data-quarter="10"]`)[0]
        const company_year_tons_new = company_year_tons_old + (product_new_tons - product_old_tons)
        company_year_tons_new_cell.innerText = formatNum(company_year_tons_new)

        diff_tons =  getDiff(company_year_tons_new, company_row.querySelectorAll(`.prev_tons[data-quarter="10"]`)[0].innerText)
        const diff_company_tons_cell = company_row.querySelectorAll(`.diff[data-quarter="10"][data-type="volume"]`)[0]
        diff_company_tons_cell.innerHTML = `${diff_tons}`






        //РЕГИОН
        const region_row = table.querySelectorAll(`.type_region[data-region="${region}"]`)[0]
        let region_month_cash_old  = parseInt(region_row.querySelectorAll(`.current_cash[data-month="${month}"]`)[0].innerText.replace(/ /g,''))
        if (isNaN(region_month_cash_old)) {
            region_month_cash_old = 0
        }
        //Устанавливаем новое значение выручки на месяц региона
        const region_month_cash_new  = region_month_cash_old + (product_new_cash - product_old_cash)
        const region_month_cash_cell = region_row.querySelectorAll(`.current_cash[data-month="${month}"]`)[0]
        region_month_cash_cell.innerText = formatNum(region_month_cash_new)


        //Устанавливаем новое значение выручки на квартал региона
        const region_quarter_old_value = parseInt(region_row.querySelectorAll(`.current_cash[data-quarter="${getQuarter(month)}"]`)[0].innerText.replace(/ /g,''))
        const region_quarter_cell = region_row.querySelectorAll(`.current_cash[data-quarter="${getQuarter(month)}"]`)[0]
        const region_quarter_cash_new = region_quarter_old_value + (product_new_cash - product_old_cash)
        region_quarter_cell.innerText = formatNum(region_quarter_cash_new)

        //Устанавливаем новое значение выручки на год региона
        const region_year_old_value = parseInt(region_row.querySelectorAll(`.current_cash[data-quarter="10"]`)[0].innerText.replace(/ /g,''))
        const region_year_cell = region_row.querySelectorAll(`.current_cash[data-quarter="10"]`)[0]
        const region_year_cash_new = region_year_old_value + (product_new_cash - product_old_cash)
        region_year_cell.innerText = formatNum(region_year_cash_new)

        diff_cash =  getDiff(region_year_cash_new, region_row.querySelectorAll(`.prev_tons[data-quarter="10"]`)[0].innerText)
        const diff_region_cash_cell = region_row.querySelectorAll(`.diff[data-quarter="10"][data-type="value"]`)[0]
        diff_region_cash_cell.innerHTML = `${diff_cash}`


        // базовые значения по тоннам регион
        let region_month_tons_old  = parseInt(region_row.querySelectorAll(`.current_tons[data-month="${month}"]`)[0].innerText.replace(/ /g,''))
        if (isNaN(region_month_tons_old)) {
            region_month_tons_old = 0
        }
        //Устанавливаем новое значение тонн на квартал регион
        const region_month_tons_new  = region_month_tons_old + (product_new_tons - product_old_tons)
        const region_month_tons_cell = region_row.querySelectorAll(`.current_tons[data-month="${month}"]`)[0]
        region_month_tons_cell.innerText = formatNum(region_month_tons_new)

        //Устанавливаем новое значение тонн на квартал регион
        const region_quarter_tons_old = parseInt(region_row.querySelectorAll(`.current_tons[data-quarter="${getQuarter(month)}"]`)[0].innerText.replace(/ /g,''))
        const region_quarter_tons_cell = region_row.querySelectorAll(`.current_tons[data-quarter="${getQuarter(month)}"]`)[0]
        const region_quarter_tons_new = region_quarter_tons_old + (product_new_tons - product_old_tons)
        region_quarter_tons_cell.innerText = formatNum(region_quarter_tons_new)

        //Устанавливаем новое значение тонн на год регион
        const region_year_tons_old = parseInt(region_row.querySelectorAll(`.current_tons[data-quarter="10"]`)[0].innerText.replace(/ /g,''))
        const region_year_tons_cell = region_row.querySelectorAll(`.current_tons[data-quarter="10"]`)[0]
        const region_year_tons_new = region_year_tons_old + (product_new_tons - product_old_tons)
        region_year_tons_cell.innerText = formatNum(region_year_tons_new)

        diff_tons =  getDiff(region_year_tons_new, region_row.querySelectorAll(`.prev_tons[data-quarter="10"]`)[0].innerText)
        const diff_region_tons_cell = region_row.querySelectorAll(`.diff[data-quarter="10"][data-type="volume"]`)[0]
        diff_region_tons_cell.innerHTML = `${diff_tons}`








        //ИТОГО
        const sum_row = table.querySelectorAll(`.type_sum`)[0]
        let sum_month_cash_old  = parseInt(sum_row.querySelectorAll(`.current_cash[data-month="${month}"]`)[0].innerText.replace(/ /g,''))
        if (isNaN(sum_month_cash_old)) {
            sum_month_cash_old = 0
        }
        //Устанавливаем новое значение выручки на месяц итого
        const sum_month_cash_new  = sum_month_cash_old + (product_new_cash - product_old_cash)
        const sum_month_cash_cell = sum_row.querySelectorAll(`.current_cash[data-month="${month}"]`)[0]
        sum_month_cash_cell.innerText = formatNum(sum_month_cash_new)


        //Устанавливаем новое значение выручки на квартал итого
        const sum_quarter_old_value = parseInt(sum_row.querySelectorAll(`.current_cash[data-quarter="${getQuarter(month)}"]`)[0].innerText.replace(/ /g,''))
        const sum_quarter_cell = sum_row.querySelectorAll(`.current_cash[data-quarter="${getQuarter(month)}"]`)[0]
        const sum_quarter_cash_new = sum_quarter_old_value + (product_new_cash - product_old_cash)
        sum_quarter_cell.innerText = formatNum(sum_quarter_cash_new)

        //Устанавливаем новое значение выручки на год региона
        const sum_year_old_value = parseInt(sum_row.querySelectorAll(`.current_cash[data-quarter="10"]`)[0].innerText.replace(/ /g,''))
        const sum_year_cell = sum_row.querySelectorAll(`.current_cash[data-quarter="10"]`)[0]
        const sum_year_cash_new = sum_year_old_value + (product_new_cash - product_old_cash)
        sum_year_cell.innerText = formatNum(sum_year_cash_new)

        diff_cash =  getDiff(sum_year_cash_new, sum_row.querySelectorAll(`.prev_tons[data-quarter="10"]`)[0].innerText)
        const diff_sum_cash_cell = sum_row.querySelectorAll(`.diff[data-quarter="10"][data-type="value"]`)[0]
        diff_sum_cash_cell.innerHTML = `${diff_cash}`


        // базовые значения по тоннам регион
        let sum_month_tons_old  = parseInt(sum_row.querySelectorAll(`.current_tons[data-month="${month}"]`)[0].innerText.replace(/ /g,''))
        if (isNaN(sum_month_tons_old)) {
            sum_month_tons_old = 0
        }
        //Устанавливаем новое значение тонн на квартал регион
        const sum_month_tons_new  = sum_month_tons_old + (product_new_tons - product_old_tons)
        const sum_month_tons_cell = sum_row.querySelectorAll(`.current_tons[data-month="${month}"]`)[0]
        sum_month_tons_cell.innerText = formatNum(sum_month_tons_new)

        //Устанавливаем новое значение тонн на квартал регион
        const sum_quarter_tons_old = parseInt(sum_row.querySelectorAll(`.current_tons[data-quarter="${getQuarter(month)}"]`)[0].innerText.replace(/ /g,''))
        const sum_quarter_tons_cell = sum_row.querySelectorAll(`.current_tons[data-quarter="${getQuarter(month)}"]`)[0]
        const sum_quarter_tons_new = sum_quarter_tons_old + (product_new_tons - product_old_tons)
        sum_quarter_tons_cell.innerText = formatNum(sum_quarter_tons_new)

        //Устанавливаем новое значение тонн на год регион
        const sum_year_tons_old = parseInt(sum_row.querySelectorAll(`.current_tons[data-quarter="10"]`)[0].innerText.replace(/ /g,''))
        const sum_year_tons_cell = sum_row.querySelectorAll(`.current_tons[data-quarter="10"]`)[0]
        const sum_year_tons_new = sum_year_tons_old + (product_new_tons - product_old_tons)
        sum_year_tons_cell.innerText = formatNum(sum_year_tons_new)

        diff_tons =  getDiff(sum_year_tons_new, sum_row.querySelectorAll(`.prev_tons[data-quarter="10"]`)[0].innerText)
        const diff_sum_tons_cell = sum_row.querySelectorAll(`.diff[data-quarter="10"][data-type="volume"]`)[0]
        diff_sum_tons_cell.innerHTML = `${diff_tons}`








        let product_name = parent.getAttribute("data-product")
        let company_name = parent.getAttribute("data-company")


        const btn_save_changes = parent.querySelectorAll(`.btn_save_planning_changes[data-month="${month}"]`)[0]
        btn_save_changes.style.display = 'block'
        btn_save_changes.setAttribute("data-new",  JSON.stringify({product_name: product_name,
            raf: data_planning.raf,
            company_name: company_name,
            volume: volume,
            price: price,
            year: data_planning.year,
            month:  month}))

    }
    function savePlanningChanges(){
        this.style.display = 'none'

        const row = this.parentElement.parentElement.parentElement
        const tons_prev = row.querySelectorAll(`.prev_tons[data-month="${data_planning.month}"]`)[0].innerHTML

        console.log("row ", row)
        console.log("tons_prev ", tons_prev)
        let body = JSON.parse(this.getAttribute("data-new"))
        body.tons_prev = "123"
        console.log("body ", body)
        body.tons_prev = tons_prev
        sendRequest('POST', 'update_planning', body)
            .then(data => {
                showNotify("Changes saved")

                if (data.diff){
                    showPopup("planning_comment")

                    document.getElementById('planning_comment_textarea').value = data.comment
                    let text_for_comment = `Please make your note about significant (50%) difference of your plan for product ${body.product_name}: ${formatNum(data.tons_prev)} kg -> ${formatNum(data.tons_current)} kg`
                    document.getElementById('planning_comment_text').innerText = text_for_comment

                    const btn = document.getElementById('btn_save_planning_comment')
                    btn.setAttribute("data-raf-id", data.raf_id)
                    btn.setAttribute("data-new-value", JSON.stringify(body))

                    row.querySelectorAll(".show_plan_comment")[0].src = 'img/info_blue.svg'
                }

            })
            .catch(err => console.log(err))
    }


    function showPlanDetails(){
        const div_with_value = this.parentElement.parentElement.parentElement.parentElement

        getPlanningDetailValues()
        setPlanningDetailFilters()

        function getPlanningDetailValues(){
            let product_name = ''
            let company_name = ''

            let region = ''
            let plan_for = ''
            if (div_with_value.classList.contains("type_product")) {
                plan_for = 'product'
                product_name = div_with_value.getAttribute("data-product")
                company_name = div_with_value.getAttribute("data-company")
            } else if (div_with_value.classList.contains("type_company")) {
                plan_for = 'company'
                company_name = div_with_value.getAttribute("data-company")
            } else if (div_with_value.classList.contains("type_region")) {
                plan_for = 'region'
                region = div_with_value.getAttribute("data-region")
            }


            current_plan_comment = {
                plan_for: plan_for,
                region: region,
                company_name: company_name,
                raws:  ["APPLE", "ORANGE", "LEMON"],
                types: ["HMA","HMC","LMCA","LMCC","LMAA","LMAC"],

                product_name: product_name,

                year:   data_planning.year,
                month:  data_planning.month,
                raf:    data_planning.raf,
            }

        }
        function setPlanningDetailFilters(){

            if (current_plan_comment.plan_for == 'region') {
                let region_code = current_plan_comment.region
                let buyers = main_data.buyers.filter(a => {return a.region == region_code}).map(b => b.name)
                plan_detail_filter_customers.setValue(buyers)
            } else {
                plan_detail_filter_customers.setValue(current_plan_comment.company_name)
            }


            // plan_detail_filter_raws.setValue(["APPLE", "ORANGE", "LEMON"])
            // plan_detail_filter_types.setValue(["HMA","HMC","LMCA","LMCC","LMAA","LMAC"])

            if (current_plan_comment.plan_for == 'region' || current_plan_comment.plan_for == 'company') {
                plan_detail_filter_products.setValue(main_data.products.map(a => a.name))
            } else {
                plan_detail_filter_products.setValue(current_plan_comment.product_name)
            }
        }

        updatePlanDetails(current_plan_comment)

    }
    document.getElementById('btn_update_planning_detail').onclick = function() {


        current_plan_comment = {
            plan_for:     "custom",
            region:       "",
            company_name: plan_detail_filter_customers.getResult(),
            // raws:  plan_detail_filter_raws.getResult(),
            // types: plan_detail_filter_types.getResult(),
            product_name: plan_detail_filter_products.getResult(),

            year:   data_planning.year,
            month:  data_planning.month,
            raf:    data_planning.raf,
        }

        console.log("current_plan_comment ", current_plan_comment)
        updatePlanDetails(current_plan_comment)
    }
    let current_plan_comment = {}
    function updatePlanDetails(plan_details){


        document.getElementById('div_change_comment').style.display = 'none'
        document.getElementById("table_planning_comments2").style.display = 'none'
        document.getElementById("table_planning_load").style.display = 'flex'
        document.getElementById("table_planning_update").style.display = 'none'

        showPopup("planning_comments2")
        getPlanComment(plan_details)
    }
    function getPlanComment(plan_details){

        sendRequest('POST', 'get_plan_comments', plan_details )
            .then(data => {

                document.getElementById("table_planning_comments2").style.display = 'block'
                document.getElementById("table_planning_load").style.display = 'none'

                document.getElementById('plan_header_fact_prev').innerText = `Fact ${data_planning.year - 1}`
                document.getElementById('plan_header_raf0').innerText = `Budget ${data_planning.year }`
                document.getElementById('plan_header_raf1').innerText = `RAF I ${data_planning.year }`
                document.getElementById('plan_header_raf2').innerText = `RAF II ${data_planning.year }`
                document.getElementById('plan_header_raf3').innerText = `RAF III ${data_planning.year }`
                document.getElementById('plan_header_raf4').innerText = `RAF IV ${data_planning.year }`
                document.getElementById('plan_header_fact').innerText = `Fact ${data_planning.year }`


                document.getElementById('planning_comments_header_customer').innerHTML = `Customer: ${current_plan_comment.company_name}`
                document.getElementById('planning_comments_header_product') .innerHTML = `Product: ${current_plan_comment.product_name}`

                document.getElementById('planning_comments_header_customer').setAttribute("data-customer", current_plan_comment.company_name)
                document.getElementById('planning_comments_header_product') .setAttribute("data-product", current_plan_comment.product_name)



                let table_rows = ''
                data.raf_table.forEach(function(month_row, i, arr) {

                    const month_num = i + 1
                    let month_name = getMonthName(month_num)


                    const quarter = getQuarter(month_num)
                    if (quarter > 4) {month_name = "YEAR"}

                    //raf0:              0,   # 0
                    //raf1:              0,   # 1
                    //raf1_diff:         0,   # 2
                    //raf1_comment:      "",  # 3
                    //raf2:              0,   # 4
                    //raf2_diff:         0,   # 5
                    //raf2_comment:      "",  # 6
                    //raf3:              0,   # 7
                    //raf3_diff:         0,   # 8
                    //raf3_comment:      "",  # 9
                    //raf4:              0,   # 10
                    //raf4_diff:         0,   # 11
                    //raf4_comment:      "",  # 12
                    //fact:              0,   # 13
                    //fact_diff:         0,   # 14
                    //fact_prev:         0,   # 15
                    //fact_prev_diff:    0,   # 16
                    //fact_prev_comment: "",  # 17


                    let cell_diff = ""
                    if (month_row["fact_prev_diff"] > 0)      { cell_diff = `${month_row["fact_prev_diff"]}%<img src="img/small_arrow_up.svg" />` }
                    else if (month_row["fact_prev_diff"] < 0) { cell_diff = `${month_row["fact_prev_diff"]}%<img src="img/small_arrow_down.svg" />`}
                    let has_comment_class = month_row["fact_prev_comment"] == "" ? "" : "has_comment"
                    let has_comment_img   = ""


                    let row_value = `
                        <div class="row">
                            <div class="cell_value name" data-month="${month_num}">${month_name}</div>
                            <div class="cell_value" data-type="fact_prev"  data-month="${month_num}">${formatNum(month_row["fact_prev"])}</div>
                            <div class="cell_diff  ${has_comment_class}"   data-month="${month_num}"  data-type="raf0"  data-tippy-content="${month_row["fact_prev_comment"]}">${cell_diff}${has_comment_img}</div>
                            <div class="cell_value" data-type="raf0"  data-month="${month_num}">${formatNum(month_row["raf0"])}</div>`


                    cell_diff = ""
                    if (month_row["raf1_diff"] > 0)      { cell_diff = `${month_row["raf1_diff"]}%<img src="img/small_arrow_up.svg" />` }
                    else if (month_row["raf1_diff"] < 0) { cell_diff = `${month_row["raf1_diff"]}%<img src="img/small_arrow_down.svg" />`}
                    has_comment_class = month_row["raf1_comment"] == "" ? "" : "has_comment"

                    row_value += `
                            <div class="cell_diff ${has_comment_class}"  data-month="${month_num}"  data-type="raf1"  data-tippy-content="${month_row["raf1_comment"]}">${cell_diff}${has_comment_img}</div>
                            <div class="cell_value"  data-type="raf1" data-month="${month_num}">${formatNum(month_row["raf1"])}</div>`


                    cell_diff = ""
                    if (quarter >= 2 && current_plan_comment.raf >= 2) {
                        //if (quarter >= 2) {
                        if (month_row["raf2_diff"] > 0) { cell_diff = `${month_row["raf2_diff"]}%<img src="img/small_arrow_up.svg" />` }
                        else if (month_row["raf2_diff"] < 0) {cell_diff = `${month_row["raf2_diff"]}%<img src="img/small_arrow_down.svg" />`}
                        has_comment_class = month_row["raf2_comment"] == "" ? "" : "has_comment"

                        row_value += `
                            <div class="cell_diff ${has_comment_class}" data-month="${month_num}"  data-type="raf2"  data-tippy-content="${month_row["raf2_comment"]}">${cell_diff}${has_comment_img}</div>
                            <div class="cell_value" data-type="raf2"  data-month="${month_num}">${formatNum(month_row["raf2"])}</div>`
                    } else {
                        row_value += `<div class="cell_diff"></div><div class="cell_value inactive"></div>`
                    }

                    if (quarter >= 3 && current_plan_comment.raf >= 3) {
                        //if (quarter >= 3 ) {
                        cell_diff = ""
                        if (month_row["raf3_diff"] > 0) { cell_diff = `${month_row["raf3_diff"]}%<img src="img/small_arrow_up.svg" />` }
                        else if (month_row["raf3_diff"] < 0) {cell_diff = `${month_row["raf3_diff"]}%<img src="img/small_arrow_down.svg" />`}

                        has_comment_class = month_row["raf3_comment"] == "" ? "" : "has_comment"

                        row_value += `
                            <div class="cell_diff  ${has_comment_class}" data-month="${month_num}"  data-type="raf3"  data-tippy-content="${month_row["raf3_comment"]}">${cell_diff}${has_comment_img}</div>
                            <div class="cell_value" data-type="raf3" data-month="${month_num}">${formatNum(month_row["raf3"])}</div>`
                    } else {
                        row_value += `<div class="cell_diff"></div><div class="cell_value inactive"></div>`
                    }

                    if (quarter >= 4 && current_plan_comment.raf >= 4) {
                        //if (quarter >= 4) {
                        cell_diff = ""
                        if (month_row["raf4_diff"] > 0) { cell_diff = `${month_row["raf4_diff"]}%<img src="img/small_arrow_up.svg" />` }
                        else if (month_row["raf4_diff"] < 0) {cell_diff = `${month_row["raf4_diff"]}%<img src="img/small_arrow_down.svg" />`}
                        has_comment_class = month_row["raf4_comment"] == "" ? "" : "has_comment"

                        row_value += `
                            <div class="cell_diff ${has_comment_class}" data-month="${month_num}"  data-type="raf4"  data-tippy-content="${month_row["raf4_comment"]}">${cell_diff}${has_comment_img}</div>
                            <div class="cell_value" data-type="raf4" data-month="${month_num}">${formatNum(month_row["raf4"])}</div>`
                    } else {
                        row_value += `<div class="cell_diff"></div><div class="cell_value inactive"></div>`
                    }


                    cell_diff = ""
                    if (month_row["fact_diff"] > 0) { cell_diff = `${month_row["fact_diff"]}%<img src="img/small_arrow_up.svg" />` }
                    else if (month_row["fact_diff"] < 0) {cell_diff = `${month_row["fact_diff"]}%<img src="img/small_arrow_down.svg" />`}
                    row_value += `
                            <div class="cell_diff">${cell_diff}</div>
                            <div class="cell_value" data-type="fact"  data-month="${month_num}">${formatNum(month_row["fact"])}</div>`

                    table_rows += row_value + "</div>"

                })
                document.getElementById('planning_comments_value').innerHTML = table_rows
                // <div class="cell_value selected" data-type="fact" data-month="12">0</div>

                let table = document.getElementById('table_planning_comments2')

                Array.from(table.querySelectorAll(`[data-type="fact"]`)).forEach(function(element) {
                    const row   = element.parentElement
                    const month = element.getAttribute("data-month")

                    let raf_cell = ''
                    Array.from(row.querySelectorAll(`[data-month="${month}"]`)).forEach(function(cell) {
                        if (cell.getAttribute("data-type") !== 'fact') {
                            raf_cell = cell
                        }
                    })

                    element.addEventListener("mouseenter", (e) => {
                        element.classList.add("selected")
                        raf_cell.classList.add("selected")
                    });
                    element.addEventListener("mouseleave", (e) => {
                        element.classList.remove("selected")
                        raf_cell.classList.remove("selected")
                    });

                })

                Array.from(table.querySelectorAll(`.cell_diff`)).forEach(function(element) {
                    element.addEventListener('click', changePlanComment );

                })
                Array.from(table.querySelectorAll(`.name`)).forEach(function(element) {
                    const row   = element.parentElement
                    const month = element.getAttribute("data-month")


                    element.addEventListener("mouseenter", (e) => {
                        Array.from(row.querySelectorAll(`.cell_value`)).forEach(function(cell) {
                            if (!cell.classList.contains('inactive')) {
                                cell.classList.add("selected")
                            }

                        })
                    });
                    element.addEventListener("mouseleave", (e) => {
                        Array.from(row.querySelectorAll(`.cell_value`)).forEach(function(cell) {
                            cell.classList.remove("selected")
                        })
                    });

                })

                Array.from(table.querySelectorAll(`[data-month="13"]`)).forEach(function(element) {
                    const row   = element.parentElement
                    const raf   = element.getAttribute("data-type")

                    if (element.classList.contains('inactive') || element.classList.contains('name') ){
                        return
                    }


                    let raf_num = parseInt(raf.replace("raf", ""))

                    element.addEventListener("mouseenter", (e) => {
                        Array.from(table.querySelectorAll(`.cell_value[data-type="${raf}"]`)).forEach(function(cell) {
                            if (!cell.classList.contains('inactive')) {
                                cell.classList.add("selected")
                            }
                        })

                        if (raf_num >= 2) {
                            table.querySelector('[data-type="fact"][data-month="1"]').classList.add("selected")
                            table.querySelector('[data-type="fact"][data-month="2"]').classList.add("selected")
                            table.querySelector('[data-type="fact"][data-month="3"]').classList.add("selected")
                        }
                        if (raf_num >= 3) {
                            table.querySelector('[data-type="fact"][data-month="4"]').classList.add("selected")
                            table.querySelector('[data-type="fact"][data-month="5"]').classList.add("selected")
                            table.querySelector('[data-type="fact"][data-month="6"]').classList.add("selected")
                        }
                        if (raf_num >= 4) {
                            table.querySelector('[data-type="fact"][data-month="7"]').classList.add("selected")
                            table.querySelector('[data-type="fact"][data-month="8"]').classList.add("selected")
                            table.querySelector('[data-type="fact"][data-month="9"]').classList.add("selected")
                        }

                    })
                    element.addEventListener("mouseleave", (e) => {
                        Array.from(table.querySelectorAll(`.cell_value`)).forEach(function(cell) {
                            cell.classList.remove("selected")
                        })
                    })
                })


                if (current_plan_comment.month < 13) {
                    Array.from(table.querySelectorAll(`[data-month="${current_plan_comment.month}"]`)).forEach(function(element) {
                        element.classList.add("current")
                    })
                }



                tippy('.has_comment', {
                    content: 'No comments',
                    followCursor: 'horizontal',
                    animation: 'fade',
                });


            })
            .catch(err => console.log(err))
    }
    function changePlanComment(){
        document.getElementById('div_change_comment').style.display = 'flex'
        const month = this.getAttribute("data-month")
        const current_type = this.getAttribute("data-type")
        const current_raf_num = current_type.split("raf")[1]
        document.getElementById('btn_comment_save').setAttribute("data-month", month)
        document.getElementById('btn_comment_save').setAttribute("data-raf",  current_raf_num)

        let table = document.getElementById('table_planning_comments2')
        const current_value = table.querySelector(`.cell_value[data-month="${month}"][data-type="raf${current_raf_num}"]`).innerHTML
        let prev_value = ''
        if (current_raf_num == 0) {
            prev_value    = table.querySelector(`.cell_value[data-month="${month}"][data-type="fact_prev"]`).innerHTML
            document.getElementById('comment_value_prev')   .innerHTML = prev_value + ` ${getMonthName(month)} ${data_planning.year - 1} Fact`
        } else {
            prev_value    = table.querySelector(`.cell_value[data-month="${month}"][data-type="raf${current_raf_num - 1}"]`).innerHTML
            document.getElementById('comment_value_prev')   .innerHTML = prev_value + ` ${getMonthName(month)} ${data_planning.year - 1} ${getRafName(current_raf_num - 1)}`
        }

        document.getElementById('comment_text')   .value = this.getAttribute("data-tippy-content")
        document.getElementById('comment_value_diff')   .innerHTML = this.innerHTML
        document.getElementById('comment_value_current').innerHTML = current_value + ` ${getMonthName(month)} ${data_planning.year } ${getRafName(current_raf_num)}`

    }
    document.getElementById('btn_comment_save').onclick = function() {
        showNotify("Saved")

        const month =  this.getAttribute("data-month")
        const raf = this.getAttribute("data-raf")
        const comment = document.getElementById('comment_text').value
        fetch(
            `${api_url}update_plan_comment`,
            { method: 'post',
                body: JSON.stringify({
                    product_name: document.getElementById('planning_comments_header_product').getAttribute("data-product"),
                    company_name: document.getElementById('planning_comments_header_customer').getAttribute("data-customer"),
                    year:    data_planning.year,
                    month:   month,
                    raf:     raf,
                    comment: comment
                }),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {

                let table = document.getElementById('table_planning_comments2')
                table.querySelector(`.cell_diff[data-month="${month}"][data-type="raf${raf}"]`).classList.add("has_comment")
                table.querySelector(`.cell_diff[data-month="${month}"][data-type="raf${raf}"]`).setAttribute("data-tippy-content", comment)
                document.getElementById('div_change_comment').style.display = 'none'


                //tippy('.has_comment', {
                //    content: 'No comments',
                //    followCursor: 'horizontal',
                //    animation: 'fade',
                //});
                getPlanComment()
            })
            .catch( error => console.error('error:', error) );
    }
    document.getElementById('btn_comment_cancel').onclick = function() {
        document.getElementById('div_change_comment').style.display = 'none'
    }
    document.getElementById('btn_save_planning_comment').addEventListener('click', function(){

        //const comment = `${this.getAttribute("data-values")} ${document.getElementById('planning_comment_textarea').value}`
        const comment = `${document.getElementById('planning_comment_textarea').value}`

        const new_value = JSON.parse(this.getAttribute("data-new-value"))
        const product_name = new_value.product_name
        const company_name = new_value.company_name
        const month = data_planning.month

        if (comment == '') {
            showAlert("Please write comment")
            return
        }

        fetch(
            `${api_url}update_plan_comment`,
            { method: 'post',
                body: JSON.stringify({
                    raf_id:  this.getAttribute("data-raf-id"),
                    product_name: product_name,
                    company_name: company_name,
                    year:   data_planning.year,
                    month:   data_planning.month,
                    raf:     data_planning.raf,
                    comment: comment
                }),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                const row = document.getElementById('table_planning_value').querySelector(`.spg_table_row[data-company="${company_name}"][data-product="${product_name}"]`)
                row.querySelector(`.current_tons[data-month="${month}"]`).setAttribute("data-comment", comment)

                Array.from(row.querySelectorAll(".show_plan_comment")).forEach(function(element) {
                    element.style.display = 'inline'
                    element.src = 'img/info_blue.svg'
                });
                closePopup()
            })
            .catch( error => console.error('error:', error) );
    })


    ///// - MANAGE PLANNING ////









    ///// + MANAGE PRICING ////


    let pricing_filter_industries = null
    let incoterm_name_value = ""
    let incoterm_price_value = 0
    function setPricing(products, markups, incoterms){
        let html = ''
        incoterms.map(i => i.incoterm_name).forEach((item, i) => {
            html += `<option class="filter_pricing_incoterm" data-value="${item}">${item}</option>`
        })
        document.getElementById("filter_pricing_incoterm").innerHTML = html
        filter_pricing_incoterm = new vanillaSelectBox(
            "#filter_pricing_incoterm",
            {"maxHeight":300,
                search:true,
            })




        createPricingFilters()
        function createPricingFilters(){
            let html = ''
            main_data.lists_data.manufacturer_industries.forEach((item, i) => {
                html += `<option class="pricing_filter_industry" data-value="${item}">${item}</option>`
            })
            document.getElementById("pricing_filter_industries").innerHTML = html
            pricing_filter_industries = new vanillaSelectBox(
                "#pricing_filter_industries",
                {"maxHeight":300,
                    translations : { "all": "All industries", "items": "industries"}
                })
            pricing_filter_industries.setValue(main_data.lists_data.manufacturer_industries)


            Array.from(document.querySelectorAll(".pricing_filter_industry")).forEach(function(element) {
                element.addEventListener('click', changePricingFilter );
            });

            function changePricingFilter(){
                let class_name = this.classList[2]
                let parent = this.parentElement.parentElement.parentElement.parentElement
                parent.classList.add("updated")

                setTimeout(() => {
                    products = main_data.products.filter((p) => {

                        console.log("pricing_filter_industries.getResult() ", pricing_filter_industries.getResult())
                        let filter_value = pricing_filter_industries.getResult()
                        console.log("filter_value ", filter_value)
                        console.log("p.industry ", p.industry)

                        if (filter_value.includes(p.industry)) {

                            return p
                        }
                    })


                    console.log("products ", products)
                    setPricingProducts(products)
                }, 100)


            }
        }

        Array.from(document.querySelectorAll("#div_pricing_markups > div")).forEach(function(element) {
            element.addEventListener('click', clickPricingMarkup );
        });
        function clickPricingMarkup(){
            let color = this.getAttribute("data-color")
            console.log("markups ", markups)
            let markup = markups[`${color}`]

            const markup_input = document.getElementById('input_filter_pricing_markup')
            markup_input.value = parseInt(markup)
            markup_input.focus()
            setMarkupsColor(color)


            setPricingProducts(products)
            document.getElementById('table_pricing').style.display = 'block'
            document.getElementById('pricing_help_text').style.display = 'none'
            document.getElementById('div_filter_pricing_industries').classList.remove('empty')
            // if (document.getElementById('table_pricing').innerHTML != '') {
            //     setPricingProducts(products)
            //     document.getElementById('table_pricing').style.display = 'block'
            // } else {
            //     document.getElementById('div_filter_pricing_industries').classList.remove('empty')
            //     document.getElementById('pricing_help_text').innerText = `Select industries`
            //
            //     document.getElementById('pricing_help_text').style.paddingLeft = '400px'
            // }

        }

        function setMarkupsColor(color){
            const markup_input = document.getElementById('input_filter_pricing_markup')
            const markup_input_parent =  markup_input.parentElement.parentElement

            markup_input_parent.classList.remove('red')
            markup_input_parent.classList.remove('yellow')
            markup_input_parent.classList.remove('green')
            markup_input_parent.classList.remove('white')
            markup_input_parent.classList.add(color)

            markup_input.classList.remove('yellow')
            markup_input.classList.remove('red')
            markup_input.classList.remove('green')
            markup_input.classList.remove('white')
            markup_input.classList.add(color)
        }

        document.getElementById('input_filter_pricing_markup').addEventListener('input', function(){
            let color = getMarkupColor(this.value)
            setMarkupsColor(color)

            setPricingProducts(products)
        })


        Array.from(document.querySelectorAll(".filter_pricing_incoterm")).forEach(function(element) {
            element.addEventListener('click', filterPricingIncoterm );
        });

        function filterPricingIncoterm(){



            console.log("selected_incoterm ", this.getAttribute("data-value"))

            let selected_incoterm = this.getAttribute("data-value")
            let incoterm_base = main_data.incoterms.filter((incoterm) => {
                console.log(`incoterm.incoterm_name  ${incoterm.incoterm_name}  ${incoterm.incoterm_name == selected_incoterm}`)

                if (selected_incoterm === incoterm.incoterm_name) {
                    return incoterm
                }
            })[0]

            incoterm_name_value = selected_incoterm
            let incoterm_price = (parseFloat(incoterm_base.price_40) / 24000).toFixed(2)
            incoterm_price_value = incoterm_price
            console.log("incoterm_price ", incoterm_price)
            document.getElementById('incoterm_delivery_price').innerText = `${incoterm_price}$`



            if (document.getElementById('table_pricing').innerHTML != '') {
                setPricingProducts(products)
            } else {
                document.getElementById('div_markups').classList.remove('empty')
                document.getElementById('pricing_help_text').innerText = `Set markup`
                document.getElementById('pricing_help_text').style.paddingLeft = '200px'
            }

        }


        function setPricingProducts(table_products){

            // document.getElementById('div_pricing_send').classList.remove('empty')
            document.getElementById('div_pricing_download').classList.remove('empty')
            document.getElementById('pricing_help_text').style.display = 'none'



            let result = ''



            const markup_input = document.getElementById("input_filter_pricing_markup")
            let markup_value = parseFloat(markup_input.value)
            if (parseInt(markup_value) <= 0 || markup_value == "") {
                markup_value = 0
            }


            let markup_color = getMarkupColor(markup_value)

            table_products.forEach(function(product, i) {
                let base_price = parseFloat(product.base_price).toFixed(2)
                let markup_absolute = (base_price * (markup_value / 100)).toFixed(2)

                let total_price =  parseFloat(base_price) + parseFloat(markup_absolute) + parseFloat(incoterm_price_value)

                total_price = total_price.toFixed(2)
                let row = `<div class="list-order-admin visible" data-product-id="${product.id}" >
                           <div class="text_info">
                               <div class="name">
                                   <img class="country_flag"   src="img/filter_products.svg">
                                   <div class="order_info">
                                       <div>${product.name}</div>
                                    </div>
                               </div>
                           </div>


                          <div class="settings_info_block" data-tippy-content="Standart price">
                             <div>${base_price}$</div>
                          </div>

                          <div class="settings_info_block" data-tippy-content="Markup">
                             <div>+${markup_absolute}$</div>
                          </div>

                          <div class="settings_info_block" data-tippy-content="Delivery cost">
                             <div>+${incoterm_price_value}$</div>
                          </div>
                          <div class="settings_info_block ${markup_color}" data-tippy-content="Total price">
                             <div class="total_price">${total_price}$</div>
                          </div>


                        </div>`

                result += row
            });

            const table = document.getElementById('table_pricing')
            table.innerHTML = result

            tippy('.settings_info_block', {
                followCursor: 'horizontal',
                animation: 'fade',
            });

        }
    }
    document.getElementById('div_pricing_download').addEventListener('click', function (evt) {

        const headers = {
            'Authorization': 'Token token=' + cookie_token,
            'IncotermName': incoterm_name_value,
            'Incoterm': incoterm_price_value,
            'Markup': document.getElementById('input_filter_pricing_markup').value,
            'Industries':   pricing_filter_industries.getResult().map(i => i.toLowerCase()).join(","),
            //'Content-type': 'application/json'
        }

        fetch(`${api_url}get_pricing_table`, {
            method: "post",
            headers: headers,
            body: JSON.stringify({
                incoterm_price_value:  incoterm_price_value

            })
        }).then(response => response.blob())
            .then(blob => {
                let file_name = "Pricing.xlsx"

                var url = window.URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = file_name;
                document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
                a.click();
                a.remove();  //afterwards we remove the element again
            });

    });

    ///// - MANAGE PRICING ////







    ///// + MANAGE EXCHANGE RATES ////

    function setSettingsExchange(data) {
        let result = ''

        data.forEach(function(exchange, i) {

            let row = `<div class="list-order-admin visible" data-exchange-id="${exchange.id}" >
                           <div class="text_info">
                               <div class="name">
                                   <img class="country_flag"   src="img/filter_exchange.svg">
                                   <div class="order_info">
                                       <div>${exchange.date}</div>

                                   </div>
                               </div>
                           </div>


                          <div class="settings_info_block" data-tippy-content="USD">
                             <img class="settings_info_img" src="img/currency_usd.svg"/>
                             <img class="btn_save_product_exchange_usd btn_save" src="img/currency_usd.svg" />
                             <input class="input_settings_product_exchange_usd inputs" type="number" value="${1}" placeholder="0"/>
                          </div>
                          <div class="settings_info_block" data-tippy-content="USD to EUR">
                             <img class="settings_info_img" src="img/currency_eur.svg"/>
                             <img class="btn_save_product_exchange_eur btn_save" src="img/currency_eur.svg" />
                             <input class="input_settings_product_exchange_eur inputs" type="number" value="${exchange.usd_to_eur}" placeholder="0"/>
                          </div>
                          <div class="settings_info_block" data-tippy-content="USD to RMB">
                             <img class="settings_info_img" src="img/currency_rmb.svg"/>
                             <img class="btn_save_product_exchange_rmb btn_save" src="img/currency_rmb.svg" />
                             <input class="input_settings_product_exchange_rmb inputs" type="number" value="${exchange.usd_to_rmb}" placeholder="0"/>
                          </div>
                        </div>`

            result += row
        });

        const table = document.getElementById('table_settings_exchange')
        table.innerHTML = result
    }
    document.getElementById('btn_create_exchange').addEventListener('click', function(){
        showPopup("add_exchange")
        document.getElementById('add_exchange_date').value = ""
        document.getElementById('add_exchange_rmb').value  = ""
        document.getElementById('add_exchange_eur').value  = ""
    })
    document.getElementById('btn_add_exchange').addEventListener('click', function (evt) {
        let body = {
            date:       document.getElementById('add_exchange_date').value,
            usd_to_rmb: document.getElementById('add_exchange_rmb').value,
            usd_to_eur: document.getElementById('add_exchange_eur').value,
        }

        if (body.date == '' || body.usd_to_rmb == ""  || body.usd_to_eur == "" ) {
            showAlert("Please fill all fields")
            return
        }

        sendRequest("POST", "add_exchange", body)
            .then(data => {
                if (data.error == ''){
                    setSettingsExchange(data.exchanges)
                    closePopup()
                } else {
                    showNotify(data.error)
                }

            })
            .catch(err => console.log(err))
    });
    document.getElementById('btn_delete_exchange').addEventListener('click', function (evt) {
        sendRequest("POST", "delete_exchange", {exchange_id: this.getAttribute("data-exchange-id")})
            .then(data => {
                setSettingsExchange(data.exchanges)
                closePopup()
            })
            .catch(err => console.log(err))
    });

    ///// - MANAGE EXCHANGE RATES ////







    ///// + CREATE PRODUCT ////
    function createProductsTable(data){
        let result = ''

        data.forEach(function(product, i) {


            let row = `<div class="list-order-admin visible" data-product-id="${product.id}" >
                           <div class="text_info">
                               <div class="name">
                                   <img class="country_flag"   src="img/filter_products.svg">
                                   <div class="order_info">
                                       <div>${product.name}</div>
                                   </div>
                               </div>
                           </div>


                          <div class="settings_info_block" data-tippy-content="Production time, days. Click to change">
                             <img class="settings_info_img" src="img/delivery_days.svg"/>
                             <img class="btn_save_product_production_time btn_save" src="img/save_small.svg" />
                             <input class="input_settings_product_production_time inputs" type="number" value="${product.lead_time}" placeholder="0"/>
                          </div>


                          <div  class="settings_info_block" data-tippy-content="Standart price, USD. Click to change">
                             <img class="settings_info_img" src="img/dollar_finish.svg"/>
                             <img class="btn_save_standart_price btn_save" src="img/save_small.svg" />
                             <input class="input_settings_standart_price inputs" type="number" value="${product.base_price}" placeholder="0"/>
                          </div>

                        </div>`

            result += row
        })

        const table = document.getElementById('table_settings_products')
        table.innerHTML = result



        Array.from(table.getElementsByClassName("settings_info_block")).forEach(function(element) {
            element.addEventListener('click', editBaseProductInfo )
        });
        function editBaseProductInfo(){
            let btn_save = this.getElementsByClassName("btn_save")[0]
            let image    = this.getElementsByClassName("settings_info_img")[0]
            let input    = this.getElementsByClassName("inputs")[0]

            btn_save.style.display = 'block'
            image.style.display    = 'none'
            input.classList.add('edit')
            input.focus()
        }


        Array.from(table.getElementsByClassName("btn_save")).forEach(function(element) {
            element.addEventListener('click', saveBaseProductInfo )
        });
        function saveBaseProductInfo(e){
            e.preventDefault()
            e.stopPropagation()

            let btn_save = this.parentElement.getElementsByClassName("btn_save")[0]
            let image    = this.parentElement.getElementsByClassName("settings_info_img")[0]
            let input    = this.parentElement.getElementsByClassName("inputs")[0]

            if (parseInt(input.value) <= 0) {
                showAlert("New value must be greater than 0")
                return
            }


            btn_save.style.display = 'none'
            image.style.display    = 'block'
            input.classList.remove('edit')
            input.classList.add('edited')

            let body = {
                product_id: this.parentElement.parentElement.getAttribute("data-product-id"),
                new_value:  input.value
            }

            let api_request = ''
            if (btn_save.classList.contains('btn_save_product_production_time')) {
                api_request = 'set_product_lead_time'
            } else if (btn_save.classList.contains('btn_save_standart_price')) {
                api_request = 'set_product_base_price'
            }

            console.log("api_request ", api_request)
            console.log("body ", body)

            sendRequest("post", api_request, body)
                .then(data => {
                    showNotify("Changes saved")
                })
        }
    }

    let create_product_industry   = null
    let create_product_category_1 = null
    let create_product_category_2 = null
    let create_product_category_3 = null
    window[`product_category_1`] = null
    window[`product_category_2`] = null
    window[`product_category_3`] = null
    document.getElementById('btn_create_product').addEventListener('click', function(){
        showPopup("create_product")
        document.getElementById('div_product_base').style.display = 'block'
        document.getElementById('div_product_specification').style.display = 'none'

        document.getElementById('header_create_product').innerText = "Add product"
        document.getElementById('create_product_name').value = ""
        document.getElementById('create_product_description').value = ""
        document.getElementById('create_product_base_price').value = ""
        document.getElementById('create_product_min_count').value = ""
        document.getElementById('create_product_produced_days').value = ""


        create_product_industry.setValue("")
        create_product_category_1.setValue("")
        create_product_category_2.setValue("")
        create_product_category_3.setValue("")

    })
    document.getElementById('btn_product_next').addEventListener('click', function(){
        let category_1 = create_product_category_1 == null ? null : create_product_category_1.getResult()
        let category_2 = create_product_category_2 == null ? null : create_product_category_2.getResult()
        let category_3 = create_product_category_3 == null ? null : create_product_category_3.getResult()

        let body = {
            name:          document.getElementById('create_product_name').value,
            description:   document.getElementById('create_product_description').value,
            base_price:    document.getElementById('create_product_base_price').value,
            min_count:     document.getElementById('create_product_min_count').value,
            produced_days: document.getElementById('create_product_produced_days').value,
            industry: create_product_industry.getResult(),
            category_1: category_1,
            category_2: category_2,
            category_3: category_3,
        }

        sendRequest('post', 'create_product', body)
            .then(data => {
                document.getElementById('header_create_product').innerText = "Upload specification"
                document.getElementById('div_product_base').style.display = 'none'
                document.getElementById('div_product_specification').style.display = 'block'
                document.getElementById('btn_save_product').setAttribute("data-product-id", data.product_id)

            })
            .catch(err => console.log(err))


    })
    document.getElementById('product_specification').onclick = function(){
        document.getElementById('product_specification_file').click()
    }
    document.getElementById('product_specification_file').onchange = function(){
        document.getElementById('product_specification').value = this.files[0].name
    }
    document.getElementById('btn_save_product').onclick = function(){
        const formData = new FormData();
        const file_value = document.getElementById('product_specification_file');
        const file_name  = document.getElementById('product_specification_file').value;

        formData.append('sender_id', main_data.user.id);
        formData.append('product_id', this.getAttribute("data-ticket-id"));
        formData.append('file_name', file_name);
        formData.append('token',     cookie_token)
        formData.append('file', file_value.files[0]);


        if (file_value.files.length == 0) {
            showAlert("Select file")
            return;
        }



        fetch(api_url + 'save_product_specification', {
            method: 'PUT',
            body: formData
        })
            .then((response) => response.json())
            .then((data) => {
                closePopup()
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    document.getElementById('div_product_category_create').addEventListener('click', function(){
        if (document.getElementById('div_product_category_1').style.display == 'none') {
            document.getElementById('div_product_category_1').style.display = 'block'
        } else if (document.getElementById('div_product_category_2').style.display == 'none') {
            document.getElementById('div_product_category_2').style.display = 'block'
        } else if (document.getElementById('div_product_category_3').style.display == 'none') {
            document.getElementById('div_product_category_3').style.display = 'block'
            document.getElementById('div_product_category_create').style.display = 'none'
        }
    })
    Array.from(document.getElementsByClassName("btn_edit_category_name")).forEach(function(element) {
        element.addEventListener('click', editCategoryName  )
    });
    function editCategoryName(){
        let category_num = this.getAttribute("data-value")
        showPopup("edit_category_name")
        document.getElementById('new_category_name').value = ""
        document.getElementById('btn_update_category_name').setAttribute("data-category-num", category_num)
    }
    document.getElementById('btn_update_category_name').addEventListener('click', function(){
        let body = {category_num: this.getAttribute("data-category-num"),
            new_name: document.getElementById('new_category_name').value}

        if (body.new_name == ""){
            showAlert("Please fill all fields")
            return
        }
        sendRequest('post', 'update_category_name', body)
            .then(data => {
                showNotify("Saved")
                closePopup()
                main_data.lists_data.product_categories = data.product_categories
                createProductsParams(data.product_categories)
            })
            .catch(err => console.log(err))
    })
    function createProductsParams(categories){
        document.getElementById(`div_product_category_1`).style.display = 'none'
        document.getElementById(`div_product_category_2`).style.display = 'none'
        document.getElementById(`div_product_category_3`).style.display = 'none'
        document.getElementById(`div_product_category_create`).style.display = 'none'

        if (categories[2].category_values.length == 0){
            document.getElementById(`div_product_category_create`).style.display = 'flex'
        }

        if (window[`product_category_1`] != null) {
            window[`product_category_1`].removeAllTags()
            window[`product_category_1`].destroy()
        }
        if (window[`product_category_2`] != null) {
            window[`product_category_2`].removeAllTags()
            window[`product_category_2`].destroy()
        }
        if (window[`product_category_3`] != null) {
            window[`product_category_3`].removeAllTags()
            window[`product_category_3`].destroy()
        }

        categories.forEach((item, i) => {
            createProductCategory(item, i + 1)
        })

        updateFieldsForProductCreate()

        function createProductCategory(value, i){
            if (value.category_values.length != 0) {
                document.getElementById(`div_product_category_${i}`).style.display = 'block'
            }

            document.getElementById(`product_category_${i}_name`).innerText = value.category_name
            tag_listener = false
            let dom = document.getElementById(`product_category_${i}_value`)
            window[`product_category_${i}`] = new Tagify(dom, {
                transformTag        : transformTag,
                callbacks        : {
                    add    : updateProductCategory,  // callback when adding a tag
                    remove : updateProductCategory   // callback when removing a tag
                },
                dropdown: {
                    classname: "tags-look", // <- custom classname for this dropdown, so it could be targeted
                    enabled: 0,             // <- show suggestions on focus
                    closeOnSelect: false    // <- do not hide the suggestions dropdown once an item has been selected
                }
            })

            window[`product_category_${i}`].addTags(value.category_values)
            tag_listener = true
        }

        function updateProductCategory(){
            if (tag_listener == false) {
                return
            }

            let values = []
            if (window[`product_category_1`] != null) {
                let category_values = []
                window[`product_category_1`].value.forEach(item => {
                    category_values.push(item.value)
                })
                values.push(category_values)
            }
            if (window[`product_category_2`] != null) {
                let category_values = []
                window[`product_category_2`].value.forEach(item => {
                    category_values.push(item.value)
                })
                values.push(category_values)
            }
            if (window[`product_category_3`] != null) {
                let category_values = []
                window[`product_category_3`].value.forEach(item => {
                    category_values.push(item.value)
                })
                values.push(category_values)
            }

            sendRequest('post', 'update_categories_values', {values: values})
                .then(data => {
                    if (data.error != "") {
                        showAlert(data.error)
                    } else {
                        showNotify("Updated")
                    }

                    main_data.lists_data.product_categories = data.product_categories
                    createProductsParams(data.product_categories)
                })
                .catch(err => console.log(err))
        }

    }
    function updateFieldsForProductCreate(){
        document.getElementById("div_create_product_category_1").style.display = 'none'
        document.getElementById("div_create_product_category_2").style.display = 'none'
        document.getElementById("div_create_product_category_3").style.display = 'none'


        createProductIndustry()
        createProductCategory1()
        createProductCategory2()
        createProductCategory3()


        function createProductIndustry(){
            let html = ''
            main_data.lists_data.industries.forEach((item, i) => {
                html += `<option data-value="${item}">${item}</option>`
            })
            document.getElementById("create_product_industry").innerHTML = html
            create_product_industry = new vanillaSelectBox(
                "#create_product_industry",
                {"maxHeight":300,
                    search:true,
                    translations : { "all": "All countries", "items": "countries"}
                })
        }

        function createProductCategory1(){
            if (main_data.lists_data.product_categories[0].category_values.length > 0) {
                document.getElementById("div_create_product_category_1").style.display = 'block'
                document.getElementById("header_create_product_category_1").innerText = main_data.lists_data.product_categories[0].category_name
                let html = ''
                main_data.lists_data.product_categories[0].category_values.forEach((item, i) => {
                    html += `<option data-value="${item}">${item}</option>`
                })
                document.getElementById("create_product_category_1").innerHTML = html
                create_product_category_1 = new vanillaSelectBox(
                    "#create_product_category_1",
                    {"maxHeight":300,
                        search:true,
                        translations : { "all": "All countries", "items": "countries"}
                    })
            }
        }

        function createProductCategory2(){
            if (main_data.lists_data.product_categories[1].category_values.length > 0) {
                document.getElementById("div_create_product_category_2").style.display = 'block'
                document.getElementById("header_create_product_category_2").innerText = main_data.lists_data.product_categories[1].category_name
                let html = ''
                main_data.lists_data.product_categories[1].category_values.forEach((item, i) => {
                    html += `<option data-value="${item}">${item}</option>`
                })
                document.getElementById("create_product_category_2").innerHTML = html
                create_product_category_2 = new vanillaSelectBox(
                    "#create_product_category_2",
                    {"maxHeight":300,
                        search:true,
                        translations : { "all": "All countries", "items": "countries"}
                    })
            }
        }

        function createProductCategory3(){
            if (main_data.lists_data.product_categories[2].category_values.length > 0) {
                document.getElementById("div_create_product_category_3").style.display = 'block'
                document.getElementById("header_create_product_category_3").innerText = main_data.lists_data.product_categories[2].category_name
                let html = ''
                main_data.lists_data.product_categories[2].category_values.forEach((item, i) => {
                    html += `<option data-value="${item}">${item}</option>`
                })
                document.getElementById("create_product_category_3").innerHTML = html
                create_product_category_3 = new vanillaSelectBox(
                    "#create_product_category_3",
                    {"maxHeight":300,
                        search:true,
                        translations : { "all": "All countries", "items": "countries"}
                    })
            }
        }

    }



    let manufacturer_product = {
        id:    0,
        action_type:   'create',
        name:          '',
        product_type:  '',
        raw:           '',
        category:      '',
        price_type:    '',
        price_value:   '',
        min_count:     '',
        industry:      '',
        description:   '',
        specification: '',
        other_docs:    [],
    }
    document.getElementById('upload_specification').onchange = function() {
        console.log("changed")
        console.log("changed ", document.getElementById('upload_specification').files[0])

        const file = document.getElementById('upload_specification').files[0]
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            manufacturer_product.specification = reader.result
            document.getElementById('check_specification_loaded').style.display = 'block'
            document.getElementById('delete_specification').style.display = 'block'
            document.getElementById('div_upload_specification').style.display = 'none'

        };
        reader.onerror = function (error) {
            showAlert("Error")
            //console.log('Error: ', error);
        };
    }
    document.getElementById('delete_specification').onclick = function() {
        manufacturer_product.specification = ''
        document.getElementById('upload_specification').value = null
        document.getElementById('div_upload_specification').style.display = 'flex'
        document.getElementById('check_specification_loaded').style.display = 'none'
        document.getElementById('delete_specification').style.display = 'none'
    }
    document.getElementById('btn_manufacturer_save_product').onclick = function() {
        manufacturer_product.name         = document.getElementById('popup_product_name').value
        manufacturer_product.product_type = document.getElementById('popup_product_type').value
        manufacturer_product.raw          = document.getElementById('popup_product_raw').value
        manufacturer_product.category     = document.getElementById('popup_product_category').value

        manufacturer_product.price_type  = 'FOB'
        manufacturer_product.price_value = document.getElementById('popup_product_price_value').value
        manufacturer_product.min_count   = document.getElementById('popup_product_min_count').value
        manufacturer_product.industry    = document.getElementById('popup_product_industry').value

        manufacturer_product.description = document.getElementById('popup_product_description').value


        if (manufacturer_product.name === '' ||
            manufacturer_product.product_type === '' ||
            manufacturer_product.raw === '' ||
            manufacturer_product.category === '' ||
            manufacturer_product.price_type === '' ||
            manufacturer_product.price_value === '' ||
            manufacturer_product.min_count === '' ||
            manufacturer_product.industry === '' ||
            manufacturer_product.description === '' ||
            manufacturer_product.specification === ''
        ) {
            showAlert("Fill in all fields")
            return;
        }

        fetch(
            `${api_url}manufacturer_create_product`,
            { method: 'post',
                body: JSON.stringify(manufacturer_product),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                closePopup()
            })
            .catch( error => console.error('error:', error) );

    }

    ///// - CREATE PRODUCT ////








    ///// + MANAGE UPDATER ////

    let updater_interval = null
    function startUpdater(){
        //if (work_mode == 'dev') {
        //    return
        //}

        updater_interval = setInterval(() => {updateNewMessages()}, 10000)
        window.addEventListener('mousemove', e => {
            //console.log(`X: ${e.offsetX}    Y: ${e.offsetY}`)
            //if (update_manufacturer_interval != null){
            //    clearInterval(update_manufacturer_interval)
            //}
            //if (update_manufacturer_timeout != null){
            //    clearTimeout(update_manufacturer_timeout)
            //}
//
            //update_manufacturer_timeout = setTimeout(() => {
            //update_manufacturer_interval = setInterval(() => {updateManufacturer()}, 15000)
            //}, 10000)
        })
    }
    function stopUpdater(){
        clearInterval(updater_interval)
    }
    function updateManufacturer(){
        let today = new Date();
        let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        let dateTime = date+' '+time;
        console.log("update time ", dateTime)


        fetch(
            `${api_url}get_manufacturer_info`,
            { method: 'POST',
                body: JSON.stringify({workspace_filter: workspace_filter,
                    update_token: false,
                    hour_tail:     -1 * (new Date().getTimezoneOffset() / 60)}),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                console.log("updateManufacturer: ", json)
                //saveLoginToken(json.auth_token)

                if (!deepEqual(workspace_data, json.workspace)) {
                    console.log("workspace new")
                    workspace_data = json.workspace
                    setManufacturerWorkSpace()
                    setManufacturerAnalytic()
                }


                if (!deepEqual(main_data.debtors, json.debtors)) {
                    main_data.debtors = json.debtors
                    setDebtors(main_data.debtors)
                }

                if (!deepEqual(main_data.ordered_products, json.ordered_products)){
                    console.log("ordered_products new")
                    main_data.ordered_products = json.ordered_products
                    setOrderedProducts(json.ordered_products, "manufacturer")
                }

                if (!deepEqual(main_data.supplies, json.supplies)){
                    main_data.supplies = json.supplies
                    setSupplies(json.supplies, "manufacturer")
                }

                if (!deepEqual(main_data.projects, json.projects)){
                    main_data.projects = json.projects
                    actual_projects = json.projects
                    setProjects(actual_projects)
                }


                updateTickets(false)
                setCustomers(json.customers)
                checkPriceRequests()

                if (!deepEqual(main_data.exchanges, json.exchanges)){
                    setManufacturerIncoterms(json.incoterms)
                    createProductsTable(json.products)
                    setSettingsExchange(json.exchanges)
                }
            })
            .catch( error => console.error('error:', error) );
    }
    function updateBuyer(){
        let today = new Date();
        let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        let dateTime = date+' '+time;
        console.log("update time ", dateTime)


        fetch(
            `${api_url}get_buyer_info`,
            { method: 'POST',
                body: JSON.stringify({
                    update_token: false,
                    hour_tail: -1 * (new Date().getTimezoneOffset() / 60) }),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                console.log("updateBuyer: ", json)
                //saveLoginToken(json.auth_token)

                if (!deepEqual(workspace_data, json.workspace)) {
                    console.log("workspace new")

                    main_data.workspace = json.workspace
                    workspace_data = json.workspace
                    setBuyerWorkspace()

                    main_data.cabinet_info = json.cabinet_info
                    setCreditLimit()

                }


                if (!deepEqual(main_data.ordered_products, json.ordered_products)){
                    console.log("ordered_products new")
                    main_data.ordered_products = json.ordered_products
                    setOrderedProducts(json.ordered_products, "buyer")
                }

                if (!deepEqual(main_data.supplies, json.supplies)){
                    main_data.supplies = json.supplies
                    setSupplies(json.supplies, "buyer")
                }

                if (!deepEqual(main_data.projects, json.projects)){
                    main_data.projects = json.projects
                    actual_projects = json.projects
                    setProjects(actual_projects)
                }

                updateTickets(false)

            })
            .catch( error => console.error('error:', error) );
    }
    function checkPriceRequests(){
        sendRequest('post', 'check_price_requests', {})
            .then(data => {
                let customers = document.getElementById('table_manufacturer_buyers').getElementsByClassName('div_orders_block')
                Array.from(customers).forEach(function(element) {
                    const el = element.getElementsByClassName('price_request')[0]
                    el.style.display = 'none'

                    if (data.buyers_with_request.includes(parseInt(element.getAttribute("data-buyer-id")))) {
                        el.style.display = 'block'
                    }
                });

                if (data.buyers_with_request.length > 0 ) {
                    document.getElementById('alert_manufacturer_buyers').style.visibility = 'visible'

                } else {
                    document.getElementById('alert_manufacturer_buyers').style.visibility = 'hidden'
                }
            })
            .catch(err => console.log(err))
    }

    let message_update_times = 0
    let show_all_orders_click = {
        ordering:   false,
        production: false,
        ready:      false,

        formed:   false,
        en_route: false,
        claimed:  false,
        unpaid:   false,
    }
    function updateNewMessages(){
        //TODO uncomment
        //return
        sendRequest('post', 'get_new_messages', {})
            .then(data => {
                //return
                message_update_times += 1
                console.log("get_new_messages ", data)
                //console.log("message_update_times ", message_update_times)

                if (data.have_update ){

                    if (user_status == "manufacturer"){
                        updateManufacturer()
                    } else {
                        updateBuyer()
                    }
                }


                // return
                console.log("updateNewMessages ")
                //if (deepEqual(main_data.new_messages, data.new_messages)) {
                //    return
                //}
                console.log("updateNewMessages YES")
                main_data.new_messages = data.new_messages

                let result = {
                    products: {
                        ordering:   {new: 0, person: 0, notify: 0},
                        production: {new: 0, person: 0, notify: 0},
                        ready:      {new: 0, person: 0, notify: 0},
                    },
                    supplies:{
                        formed: {new: 0, person: 0, notify: 0},
                        en_route: {new: 0, person: 0, notify: 0},
                        claimed: {new: 0, person: 0, notify: 0},
                        unpaid: {new: 0, person: 0, notify: 0}, // claimed
                    }
                }

                let order_types    = ["ordering", "production", "ready"]
                let supplies_types = ["formed", "en_route", "claimed", "unpaid"]

                let message_types = ["new", "person", "notify"]
                let messages_for = ["product", "supply", "project"]

                let orders_have_messages   = false
                let supplies_have_messages = false
                let projects_have_messages = false

                // FOR ORDERS
                // FOR ORDERS
                // FOR ORDERS
                let all_products_divs = [
                    "div_ordered_products",
                    "div_produced_products",
                    "div_manufactured_products"
                ]
                // Считаем кол-во для блоков
                message_types.forEach(function(message_type) {
                    data.new_messages.product[`${message_type}`].forEach(function(product_id_new, i, arr) {
                        let product = main_data.ordered_products.filter(function(op) {return op.id == product_id_new})[0]
                        orders_have_messages = true
                        if ([1,2].includes(product.status)) {
                            result.products.ordering[`${message_type}`] += 1
                        } else if ([3,4].includes(product.status)) {
                            result.products.production[`${message_type}`] += 1
                        } else {
                            result.products.ready[`${message_type}`] += 1
                        }
                    })
                })


                // Обновляем суммарную информацию в блоках
                all_products_divs.forEach(function(div, i) {
                    Array.from(document.getElementsByClassName(`${div}`)).forEach(function(d) {
                        message_types.forEach(function(message_type) {

                            let container = d.getElementsByClassName(`section_new_${message_type}`)[0]
                            let counter = result.products[`${order_types[i]}`][`${message_type}`]

                            // TODO убрать ИФ после масштабирования
                            if (typeof container != 'undefined') {
                                container.classList.remove('update_true')
                                container.innerHTML = `<img src="img/${message_type}_${counter > 0}.svg"/>${counter}`
                                if (counter > 0){
                                    container.classList.add('update_true')
                                }
                            }
                        })
                    })
                })


                // Обновляем иконки чатов
                all_products_divs.forEach(function(div, i) {
                    Array.from(document.getElementsByClassName(`${div}`)).forEach(function(d) {
                        Array.from(d.getElementsByClassName(`list-ordered-product`)).forEach(function(element) {
                            let product_id = element.getAttribute("data-product-id")

                            let has_message = false
                            message_types.forEach(function(message_type) {
                                if (data.new_messages[`product`][`${message_type}`].includes(parseInt(product_id))) {
                                    has_message = true
                                }
                            })

                            if (has_message) {
                                let chat_icon = element.getElementsByClassName("open_chat_products")[0]

                                let img_src = 'img/chat_new.svg'
                                let product_raw = main_data.ordered_products.filter(function(op) {return op.id == product_id})[0]
                                if (product_raw.user_chat_activity) {
                                    img_src = 'img/chat_person_new.svg'
                                }
                                chat_icon.setAttribute("data-new", true)
                                chat_icon.style.display = "block"
                                chat_icon.setAttribute("src", img_src)
                            }
                        })
                    })
                })


                // FOR SUPPLIES
                // FOR SUPPLIES
                // FOR SUPPLIES

                let all_supplies_divs = [
                    "div_formed_supplies",
                    "div_sended_supplies",
                    "div_unpaid_supplies",
                    "div_claimed_supplies",
                ]
                // Считаем кол-во для блоков
                message_types.forEach(function(message_type) {
                    data.new_messages.supply[`${message_type}`].forEach(function(supply_id_new, i, arr) {
                        let supply = main_data.supplies.filter(function(supply) {return supply.supply.id == supply_id_new})[0]
                        supplies_have_messages = true
                        if (supply.supply.status == 6) {
                            result.supplies.formed[`${message_type}`] += 1
                        } else if (supply.supply.status < 10) {
                            result.supplies.en_route[`${message_type}`] += 1
                        } else {
                            result.supplies.unpaid[`${message_type}`] += 1
                        }

                        //console.log("supply ", supply)
                        //console.log("supply id ", supply.supply.id)

                        if (supply.supply.claim_present && !supply.supply.claim_close) {
                            result.supplies.claimed[`${message_type}`] += 1
                        }
                    })
                })

                // Для клеймовых поставок
                message_types.forEach(function(message_type) {
                    data.new_messages.claimed[`${message_type}`].forEach(function(supply_id_new, i, arr) {
                        let supply = main_data.supplies.filter(function(supply) {return supply.supply.id == supply_id_new})[0]

                        if (supply.supply.claim_present && !supply.supply.claim_close) {
                            result.supplies.claimed[`${message_type}`] += 1
                        }
                    })
                })

                // Обновляем суммарную информацию в блоках
                all_supplies_divs.forEach(function(div, i) {
                    Array.from(document.getElementsByClassName(`${div}`)).forEach(function(d) {
                        message_types.forEach(function(message_type) {

                            let container = d.getElementsByClassName(`section_new_${message_type}`)[0]
                            let counter = result.supplies[`${supplies_types[i]}`][`${message_type}`]

                            // TODO убрать ИФ после масштабирования
                            if (typeof container != 'undefined') {
                                container.classList.remove('update_true')
                                container.innerHTML = `<img src="img/${message_type}_${counter > 0}.svg"/>${counter}`
                                if (counter > 0){
                                    container.classList.add('update_true')
                                }
                            }
                        })
                    });
                })


                // Обновляем иконки чатов
                all_supplies_divs.forEach(function(div, i) {
                    Array.from(document.getElementsByClassName(`${div}`)).forEach(function(d) {

                        Array.from(d.getElementsByClassName(`list-item-supply`)).forEach(function(element) {
                            let supply_id = element.getAttribute("data-supply-id")

                            let has_message = false
                            message_types.forEach(function(message_type) {
                                if (data.new_messages[`supply`][`${message_type}`].includes(parseInt(supply_id))) {
                                    has_message = true
                                }
                            })


                            if (has_message) {
                                let chat_icon = element.getElementsByClassName("open_chat_supplies")[0]

                                let img_src = 'img/chat_new.svg'
                                let supply_raw = main_data.supplies.filter(function(s) {return s.supply.id == supply_id})[0]
                                if (supply_raw.supply.user_chat_activity) {
                                    img_src = 'img/chat_person_new.svg'
                                }

                                chat_icon.setAttribute("data-new", true)
                                chat_icon.style.display = "block"
                                chat_icon.setAttribute("src", img_src)

                            }



                            // Для клеймовых поставок
                            has_message = false
                            message_types.forEach(function(message_type) {
                                if (data.new_messages[`claimed`][`${message_type}`].includes(parseInt(supply_id))) {
                                    has_message = true
                                }
                            })

                            if (has_message) {
                                let chat_icon = element.getElementsByClassName("open_claim_chat")[0]

                                let img_src = 'img/claim_chat_new.svg'
                                let supply_raw = main_data.supplies.filter(function(s) {return s.supply.id == supply_id})[0]

                                chat_icon.setAttribute("data-new", true)
                                chat_icon.style.display = "block"
                                chat_icon.setAttribute("src", img_src)

                            }

                        })
                    });
                })




                // FOR PROJECTS
                // FOR PROJECTS
                // FOR PROJECTS

                let all_projects_divs = [
                    "list-projects-user"
                ]

                // Обновляем иконки чатов
                all_projects_divs.forEach(function(div, i) {
                    Array.from(document.getElementsByClassName(`${div}`)).forEach(function(d) {
                        Array.from(d.getElementsByClassName(`list-project-user`)).forEach(function(element) {
                            let project_id = element.getAttribute("data-project-id")

                            let has_message = false
                            message_types.forEach(function(message_type) {
                                if (data.new_messages[`project`][`${message_type}`].includes(parseInt(project_id))) {
                                    has_message = true
                                    projects_have_messages = true
                                }
                            })

                            if (has_message) {
                                let chat_icon = element.getElementsByClassName("open_chat_projects")[0]

                                let img_src = 'img/chat_new.svg'
                                let project_raw = main_data.projects.filter(function(p) {return p.project.id == project_id})[0]
                                if (project_raw.project.user_chat_activity) {
                                    img_src = 'img/chat_person_new.svg'
                                }

                                chat_icon.setAttribute("data-new", true)
                                chat_icon.style.display = "block"
                                chat_icon.setAttribute("src", img_src)

                            }
                        });
                    });
                })



                // Обновляем рабочий стол
                Array.from(document.getElementsByClassName(`div_updates`)).forEach(function(element, i) {
                    message_types.forEach(function(message_type) {
                        messages_for.forEach(function(message_for) {
                            let parent = element.querySelector(`[data-type="${message_for}"]`)
                            let container = parent.querySelector(`[data-type="${message_type}"]`)

                            // TODO убрать ИФ после масштабирования
                            if (typeof container != 'undefined' && container != null) {
                                let value = data.new_messages[`${message_for}`][`${message_type}`].length

                                container.classList.remove("update_true")
                                if (value > 0) {
                                    container.classList.add("update_true")
                                }


                                container.innerHTML = `<img src="img/${message_type}_${value > 0}.svg"/>${getMessageUpdatesText(message_for, message_type, value)}`
                            }
                        })
                    })
                });




                // Обновляем бейджи навигации
                Array.from(document.querySelectorAll(`.nav_badge[data-type="orders"]`)).forEach(function(element, i) {
                    if (orders_have_messages || supplies_have_messages) {
                        element.classList.add('new_important')
                    } else {
                        element.classList.remove('new_important')
                    }
                })
                Array.from(document.querySelectorAll(`.nav_badge[data-type="projects"]`)).forEach(function(element, i) {
                    if (projects_have_messages) {
                        element.classList.add('new_important')
                    } else {
                        element.classList.remove('new_important')
                    }
                })


            })
            .catch(err => console.log(err))

    }
    function getMessageUpdatesText(message_for, message_type, value) {
        let text = ''
        let plurals = {
            product: "orders",
            supply: "deliveries",
            project: "projects",
        }

        switch (message_type) {
            case "new":
                let plural = plurals[message_for]
                //console.log("message_for ", message_for)
                //console.log("plural ", plural)

                if (value == 0){
                    text = `No new ${plural}`
                } else if (value == 1) {
                    text = `${value} new ${message_for != 'product' ? message_for : "order"}`
                } else {
                    text = `${value} new ${plural}`
                }
                break;

            case "person":
                if (value == 0){
                    text = `No messages`
                } else if (value == 1) {
                    text = `${value} message`
                } else {
                    text = `${value} messages`
                }
                break;

            case "notify":
                if (value == 0){
                    text = `No updates`
                } else if (value == 1) {
                    text = `${value} update`
                } else {
                    text = `${value} updates`
                }
                break;
        }

        return text;


    }

    ///// - MANAGE UPDATER ////







    ///// + MANAGE USERS ////
    function setManufacturerUsers(users){
        let html = ''
        users.forEach(function(item) {
            html +=
                `<div class="row_customer_user" data-user-id="${item.id}">
                    <img src="${item.avatar}" />
                    <div class="cell_name">${item.name}</div>
                    <div class="cell_position">${item.position}</div>

                    <div class="cell_contact_value"></div>
                    <img src="img/email.svg"  class="cell_email"  data-value="${item.email}" data-tippy-content="Get email" />
                    <img src="img/phone.svg"  class="cell_phone"  data-value="${item.phone}" data-tippy-content="Get phone" />
                    <img src="img/invite.svg" class="cell_invite"                            data-tippy-content="Send invitation" />
                    <img src="img/edit.svg"   class="edit_company_user"                              data-tippy-content="Edit" />

                </div>`
        });

        let table = document.getElementById('div_manufacturer_users')
        table.innerHTML = html

        Array.from(table.getElementsByClassName("cell_contact_value")).forEach(function(element) {
            element.addEventListener('click', copyInnerText );
        });
        Array.from(table.getElementsByClassName("cell_email")).forEach(function(element) {
            element.addEventListener('click', showContact );
        });
        Array.from(table.getElementsByClassName("cell_phone")).forEach(function(element) {
            element.addEventListener('click', showContact );
        });


        Array.from(table.getElementsByClassName("cell_invite")).forEach(function(element) {
            element.addEventListener('click', sendInvite );
        })
        Array.from(table.getElementsByClassName("edit_company_user")).forEach(function(element) {
            element.addEventListener('click', editManufacturerUser );
        });

        tippy('.cell_email, .cell_phone, .cell_invite, .edit_company_user', {
            followCursor: 'horizontal',
            animation: 'fade',
        })
    }
    function setCustomerUsers(users){
        let html = ''
        users.forEach(function(item) {
            html +=
                `<div class="row_customer_user" data-user-id="${item.id}">
                    <img src="${item.avatar}" />
                    <div class="cell_name">${item.name}</div>
                    <div class="cell_position">${item.position}</div>

                    <div class="cell_contact_value"></div>
                    <img src="img/email.svg"  class="cell_email"  data-value="${item.email}" data-tippy-content="Get email" />
                    <img src="img/phone.svg"  class="cell_phone"  data-value="${item.phone}" data-tippy-content="Get phone" />
                    <img src="img/invite.svg" class="cell_invite"                            data-tippy-content="Send invitation" />
                    <img src="img/edit.svg"   class="edit_company_user"                              data-tippy-content="Edit" />

                </div>`
        });

        let table = null
        if (user_status == "buyer") {
            table = document.getElementById('div_buyers_users_2')
        } else {
            table = document.getElementById('div_buyers_users')
        }

        table.innerHTML = html

        Array.from(table.getElementsByClassName("cell_contact_value")).forEach(function(element) {
            element.addEventListener('click', copyInnerText );
        });
        Array.from(table.getElementsByClassName("cell_email")).forEach(function(element) {
            element.addEventListener('click', showContact );
        });
        Array.from(table.getElementsByClassName("cell_phone")).forEach(function(element) {
            element.addEventListener('click', showContact );
        });


        Array.from(table.getElementsByClassName("cell_invite")).forEach(function(element) {
            element.addEventListener('click', sendInvite );
        })
        Array.from(table.getElementsByClassName("edit_company_user")).forEach(function(element) {
            element.addEventListener('click', editCompanyUser );
        });


        tippy('.cell_email, .cell_phone, .cell_invite, .edit_company_user', {
            followCursor: 'horizontal',
            animation: 'fade',
        })
    }
    function showContact(){
        let value_div = this.parentElement.getElementsByClassName('cell_contact_value')[0]

        if (value_div.innerHTML == this.getAttribute("data-value")) {
            value_div.innerHTML = ""
        } else {
            value_div.innerHTML = this.getAttribute("data-value")
            copyToClipboard(this.getAttribute("data-value"))
        }


    }
    function sendInvite(){
        const user_id = this.parentElement.getAttribute("data-user-id")
        const email   = this.parentElement.getElementsByClassName('cell_email')[0].getAttribute("data-value")

        document.getElementById('btn_get_customer_login').setAttribute("data-login", email)
        document.getElementById('div_customer_login_info').innerHTML = `You can send instruction directly to email or copy it to the clipboard`
        document.getElementById('btn_send_customer_login').setAttribute("data-user-id", user_id)
        document.getElementById('btn_send_customer_login').innerText = `Send to ${email}`


        showPopup("send_customer_login")
    }
    document.getElementById('btn_get_customer_login').addEventListener('click', function (evt) {
        const login = this.getAttribute("data-login")
        copyToClipboard(`Website: https://yourpartners.net\nLogin: ${login}`)
        //showNotify("All info is copied to buffer. You can paste (Ctrl + V) it anywhere")
        closePopup()
    })
    document.getElementById('btn_send_customer_login').addEventListener('click', function (evt) {
        sendRequest("post", 'send_customer_login', {user_id: this.getAttribute("data-user-id")})
            .then(data => {
                closePopup()
                showNotify("Sent")
            })
    })


    Array.from(document.querySelectorAll(".company_user_filters")).forEach(function(element) {
        element.addEventListener('click', filterCompanyUser );
    });
    function filterCompanyUser(){
        Array.from(document.querySelectorAll(".company_user_filters")).forEach(function(element) {
            element.classList.remove('active')
        });
        this.classList.add("active")

        Array.from(document.querySelectorAll(".div_company_user")).forEach(function(element) {
            element.style.display = 'none'
        });
        document.getElementById(`div_company_user_${this.getAttribute("data-key")}_edit`).style.display = 'block'
    }


    document.getElementById('btn_manufacturer_user_create').addEventListener('click', function (evt) {

        manufacturerUserCreate()
    })
    function manufacturerUserCreate(){
        showPopup("create_manufacturer_user")

        document.getElementById('div_manufacturer_user_base').style.display = 'block'
        document.getElementById('div_manufacturer_user_regions').style.display = 'none'
        document.getElementById('div_manufacturer_user_access').style.display = 'none'
        document.getElementById('div_manufacturer_user_chat').style.display = 'none'
        document.getElementById('div_manufacturer_user_avatar').style.display = 'none'


        document.getElementById('manufacturer_user_firstname').value = ""
        document.getElementById('manufacturer_user_surname')  .value = ""
        document.getElementById('manufacturer_user_position') .value = ""
        document.getElementById('manufacturer_user_email')    .value = ""

        if (manufacturer_user_phone != null){ manufacturer_user_phone.destroy() }

        document.getElementById('cb_manufacturer_access_products_see_edit')   .checked = false
        document.getElementById('cb_manufacturer_access_products_manage_edit').checked = false
        document.getElementById('cb_manufacturer_access_orders_see_edit')     .checked = false
        document.getElementById('cb_manufacturer_access_orders_manage_edit')  .checked = false
        document.getElementById('cb_manufacturer_access_projects_see_edit')   .checked = false
        document.getElementById('cb_manufacturer_access_projects_manage_edit').checked = false
        document.getElementById('cb_manufacturer_access_planning_see_edit').checked             = false
        document.getElementById('cb_manufacturer_access_planning_manage_edit').checked         = false
        document.getElementById('cb_manufacturer_access_price_approval_manage_edit').checked   = false
        document.getElementById('cb_manufacturer_access_customers_manage_edit').checked   = false
        document.getElementById('cb_manufacturer_access_analytics_see_edit')  .checked = false
        document.getElementById('cb_manufacturer_access_market_see_edit')     .checked = false
        document.getElementById('cb_manufacturer_access_suppliers_see_edit')  .checked = false
        document.getElementById('cb_manufacturer_access_settings_manage_edit').checked = false

        document.getElementById('manufacturer_user_avatar_edit').setAttribute("src", "https://yourpartners.net/img/avatars/base_avatar.png")




        const input = document.querySelector("#manufacturer_user_phone");
        manufacturer_user_phone = window.intlTelInput(input, {
            // any initialisation options go here
            autoHideDialCode: false,
            separateDialCode: true,
            utilsScript: "../libs/input_phone/utils.js",
        })

        setObligatoryCopy()
        setRegions()

        function setObligatoryCopy() {
            let html = ''
            main_data.manufacturer_users.forEach(user => {
                html += `<div data-user-id="${user.id}" class="user_for_obligatory_copy">
                            <img src="${user.avatar}"/>
                            <div>${user.name}</div>
                         </div>`
            })
            const div_users_for_obligatory_copy = document.getElementById('div_manufacturer_obligatory_copy')
            div_users_for_obligatory_copy.innerHTML = html
            Array.from(div_users_for_obligatory_copy.getElementsByClassName("user_for_obligatory_copy")).forEach(function(element) {
                element.addEventListener('click', addUserForObligatoryCopy );
            })
            function addUserForObligatoryCopy(){
                if (this.classList.contains("active")) {
                    this.classList.remove("active")
                } else {
                    this.classList.add("active")
                }
            }
        }

        function setRegions(){
            let html = ''
            main_data.lists_data.regions.forEach(region => {
                html += `<div data-region="${region}" class="manufacturer_user_regions">
                            <div>${region}</div>
                         </div>`
            })
            const manufacturer_user_regions = document.getElementById('manufacturer_user_regions')
            manufacturer_user_regions.innerHTML = html
            Array.from(manufacturer_user_regions.getElementsByClassName("manufacturer_user_regions")).forEach(function(element) {
                element.addEventListener('click', addRegionForUser );
            })
            function addRegionForUser(){
                if (this.classList.contains("active")) {
                    this.classList.remove("active")
                } else {
                    this.classList.add("active")
                }
            }
        }
    }
    document.getElementById('btn_manufacturer_user_next_1').addEventListener('click', function(){
        if (!manufacturer_user_phone.isValidNumber()) {
            showAlert("Invalid phone number format")
            return
        }

        let data = {
            name:       document.getElementById('manufacturer_user_firstname').value,
            surname:    document.getElementById('manufacturer_user_surname').value,
            position:   document.getElementById('manufacturer_user_position').value,
            email:      document.getElementById('manufacturer_user_email').value,
            phone_full:    manufacturer_user_phone.getNumber(),
            phone_country: manufacturer_user_phone.getSelectedCountryData().dialCode
        }

        if (data.name == "" || data.surname == "" || data.position == "" || data.email == "" || data.phone_full == ""){
            showAlert("Fill in all fields")
            return
        }

        //sendRequest('post', 'create_company_user', data)
        sendRequest('post', 'create_manufacturer_user', data)
            .then(data => {
                if (data.error != ""){
                    showAlert(data.error)
                } else {
                    document.getElementById('header_create_manufacturer_user').innerText = "Access rules"
                    document.getElementById('div_manufacturer_user_base').style.display = 'none'
                    document.getElementById('div_manufacturer_user_regions').style.display = 'block'

                    manufacturer_user_id = data.user.id
                    setManufacturerUsers(data.users)
                    main_data.manufacturer_users = data.users
                    showNotify("Saved")
                }
            })
            .catch(err => console.log(err))
    })
    document.getElementById('btn_manufacturer_user_next_2').addEventListener('click', function(){
        const manufacturer_user_regions = document.getElementById('manufacturer_user_regions')
        let regions = []
        Array.from(manufacturer_user_regions.getElementsByClassName("manufacturer_user_regions")).forEach(function(element) {
            if (element.classList.contains("active")) {
                regions.push(element.getAttribute("data-region"))
            }
        })

        let data = {
            user_id: manufacturer_user_id,
            regions: regions
        }


        sendRequest('post', 'set_manufacturer_user_regions', data)
            .then(data => {
                document.getElementById('header_create_manufacturer_user').innerText = "Access rules"
                document.getElementById('div_manufacturer_user_regions').style.display = 'none'
                document.getElementById('div_manufacturer_user_access').style.display  = 'block'
                showNotify("Saved")
            })
            .catch(err => console.log(err))
    })
    Array.from(document.querySelectorAll(`#div_manufacturer_user_access [type="checkbox"]`)).forEach(function(element) {
        element.addEventListener('change', changeAccess );
    });
    Array.from(document.querySelectorAll(`#div_manufacturer_user_access_edit [type="checkbox"]`)).forEach(function(element) {
        element.addEventListener('change', changeAccess );
    });
    function changeAccess(){

        if (this.getAttribute("data-type") == "manage" && this.checked){
            let parent = this.parentElement.parentElement.parentElement
            let cb_edit = parent.querySelectorAll('[data-type="see"]')[0]
            cb_edit.checked = true
        }

        if (this.getAttribute("data-type") == "see" && !this.checked){
            let parent = this.parentElement.parentElement.parentElement
            let cb_manage = parent.querySelectorAll('[data-type="manage"]')[0]
            cb_manage.checked = false
        }
    }
    document.getElementById('btn_manufacturer_user_next_3').addEventListener('click', function(){
        let data = {
            user_id: manufacturer_user_id,
            products_see:    document.getElementById('cb_manufacturer_access_products_see').checked,
            products_manage: document.getElementById('cb_manufacturer_access_products_manage').checked,
            orders_see:      document.getElementById('cb_manufacturer_access_orders_see').checked,
            orders_manage:   document.getElementById('cb_manufacturer_access_orders_manage').checked,
            projects_see:    document.getElementById('cb_manufacturer_access_projects_see').checked,
            projects_manage: document.getElementById('cb_manufacturer_access_projects_manage').checked,
            planning_see:    document.getElementById('cb_manufacturer_access_planning_see').checked,
            planning_manage: document.getElementById('cb_manufacturer_access_planning_manage').checked,
            price_approval_manage: document.getElementById('cb_manufacturer_access_price_approval_manage').checked,
            customers_manage: document.getElementById('cb_manufacturer_access_customers_manage').checked,

            analytics_see:   document.getElementById('cb_manufacturer_access_analytics_see').checked,
            market_see:      document.getElementById('cb_manufacturer_access_market_see').checked,
            settings_manage: document.getElementById('cb_manufacturer_access_settings_manage').checked,
        }


        sendRequest('post', 'set_manufacturer_user_accesses', data)
            .then(data => {
                document.getElementById('header_create_manufacturer_user').innerText = "Chat rules"
                document.getElementById('div_manufacturer_user_access').style.display = 'none'
                document.getElementById('div_manufacturer_user_chat').style.display = 'block'
                showNotify("Saved")
            })
            .catch(err => console.log(err))
    })
    document.getElementById('btn_manufacturer_user_next_4').addEventListener('click', function(){
        const div_manufacturer_obligatory_copy = document.getElementById('div_manufacturer_obligatory_copy')
        let copy_to = []
        Array.from(div_manufacturer_obligatory_copy.getElementsByClassName("user_for_obligatory_copy")).forEach(function(element) {
            if (element.classList.contains("active")) {
                copy_to.push(parseInt(element.getAttribute("data-user-id")))
            }
        })

        let data = {
            user_id: manufacturer_user_id,
            copy_to: copy_to
        }


        sendRequest('post', 'set_manufacturer_user_chat_rules', data)
            .then(data => {
                document.getElementById('header_create_manufacturer_user').innerText = "Set user avatar"
                document.getElementById('div_manufacturer_user_chat').style.display = 'none'
                document.getElementById('div_manufacturer_user_avatar').style.display = 'block'
                showNotify("Saved")
                main_data.manufacturer_users = data.users
            })
            .catch(err => console.log(err))
    })
    document.getElementById('manufacturer_user_avatar_edit').addEventListener('click', function(){
        document.getElementById('input_manufacturer_user_avatar').click()
    })
    document.getElementById('manufacturer_user_avatar').addEventListener('click', function(){
        document.getElementById('input_manufacturer_user_avatar').click()
    })
    document.getElementById('input_manufacturer_user_avatar').onchange = function(){

        const formData = new FormData();
        const file_name = this.files[0].name
        const file_value = document.getElementById('input_manufacturer_user_avatar');
        console.log("supply_set_document change ", file_name)
        console.log("file_value.files[0] ", file_value.files[0])
        formData.append('user_id', manufacturer_user_id);
        formData.append('file_name', file_name);
        formData.append('token',     cookie_token)
        formData.append('file', file_value.files[0])

        if (file_value.files.length == 0) {
            showAlert("Select file")
            return;
        }

        var fr = new FileReader();
        fr.onload = function () {
            document.getElementById('manufacturer_user_avatar_edit').src = fr.result;
        }
        fr.readAsDataURL(file_value.files[0]);

        fetch(api_url + 'update_manufacturer_user_avatar', {
            method: 'PUT',
            body: formData
        })
            .then((response) => response.json())
            .then((data) => {
                showNotify("Avatar updated")
                setManufacturerUsers(data.users)
                main_data.manufacturer_users = data.users
                if (document.querySelector('[data-popup-name="create_manufacturer_user"]').style.display == 'flex') {
                    closePopup()
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });

    }


    let company_user_phone = null
    let company_user_id = null
    let company_user_organization_info = null
    let company_user_phone_edit = null
    let company_user_for_edit = null
    document.getElementById('btn_buyer_create_2').addEventListener('click', function (evt) {
        buyerUserCreate()
    })
    document.getElementById('btn_buyer_create').addEventListener('click', function (evt) {
        buyerUserCreate()
    })
    function buyerUserCreate(){
        showPopup("create_company_user")

        document.getElementById('div_company_user_base').style.display = 'block'
        document.getElementById('div_company_user_access').style.display = 'none'
        document.getElementById('div_company_user_chat').style.display = 'none'
        document.getElementById('div_company_user_avatar').style.display = 'none'


        document.getElementById('set_access_to_projects').style.display = current_buyer.buyer_info.show_projects ? 'flex' : 'none'

        const input = document.querySelector("#company_user_phone");
        company_user_phone = window.intlTelInput(input, {
            // any initialisation options go here
            autoHideDialCode: false,
            separateDialCode: true,
            utilsScript: "../libs/input_phone/utils.js",
        })


        function setObligatoryCopy() {
            let html = ''
            current_buyer.users.forEach(user => {
                html += `<div data-user-id="${user.id}" class="user_for_obligatory_copy">
                            <img src="${user.avatar}"/>
                            <div>${user.name}</div>
                         </div>`
            })
            const div_users_for_obligatory_copy = document.getElementById('div_obligatory_copy')
            div_users_for_obligatory_copy.innerHTML = html
            Array.from(div_users_for_obligatory_copy.getElementsByClassName("user_for_obligatory_copy")).forEach(function(element) {
                element.addEventListener('click', addUserForObligatoryCopy );
            })
            function addUserForObligatoryCopy(){
                if (this.classList.contains("active")) {
                    this.classList.remove("active")
                } else {
                    this.classList.add("active")
                }
            }
        }
        setObligatoryCopy()

    }
    document.getElementById('btn_company_user_next_1').addEventListener('click', function(){

        if (!company_user_phone.isValidNumber()) {
            showAlert("Invalid phone number format")
            return
        }

        console.log("btn_company_user_next_1 ", company_user_organization_info)

        let data = {
            organization_type: company_user_organization_info.organization_type,
            organization_id:   company_user_organization_info.organization_id,
            name:       document.getElementById('company_user_firstname').value,
            surname:    document.getElementById('company_user_surname').value,
            position:   document.getElementById('company_user_position').value,
            email:      document.getElementById('company_user_email').value,
            phone_full:    company_user_phone.getNumber(),
            phone_country: company_user_phone.getSelectedCountryData().dialCode
        }

        if (data.name == "" || data.surname == "" || data.email == "" || data.phone_full == ""){
            showAlert("Fill in all fields")
            return
        }

        sendRequest('post', 'create_company_user', data)
            .then(data => {
                if (data.error != ""){
                    showAlert(data.error)
                } else {
                    document.getElementById('header_create_company_user').innerText = "Access rules"
                    document.getElementById('div_company_user_base').style.display = 'none'
                    document.getElementById('div_company_user_access').style.display = 'block'

                    company_user_id = data.user.id
                    showNotify("Saved")
                }
            })
            .catch(err => console.log(err))
    })
    Array.from(document.querySelectorAll(`#div_company_user_access [type="checkbox"]`)).forEach(function(element) {
        element.addEventListener('change', changeAccess );
    });
    Array.from(document.querySelectorAll(`#div_company_user_access_edit [type="checkbox"]`)).forEach(function(element) {
        element.addEventListener('change', changeAccess );
    });
    function changeAccess(){

        if (this.getAttribute("data-type") == "manage" && this.checked){
            let parent = this.parentElement.parentElement.parentElement
            let cb_edit = parent.querySelectorAll('[data-type="see"]')[0]
            cb_edit.checked = true
        }

        if (this.getAttribute("data-type") == "see" && !this.checked){
            let parent = this.parentElement.parentElement.parentElement
            let cb_manage = parent.querySelectorAll('[data-type="manage"]')[0]
            cb_manage.checked = false
        }
    }
    document.getElementById('btn_company_user_next_2').addEventListener('click', function(){
        let data = {
            user_id: company_user_id,
            products_see:    document.getElementById('cb_access_products_see').checked,
            products_manage: document.getElementById('cb_access_products_manage').checked,
            orders_see:      document.getElementById('cb_access_orders_see').checked,
            orders_manage:   document.getElementById('cb_access_orders_manage').checked,
            projects_see:    document.getElementById('cb_access_projects_see').checked,
            projects_manage: document.getElementById('cb_access_projects_manage').checked,
            suppliers_see:   document.getElementById('cb_access_suppliers_see').checked,
            documents_see:    document.getElementById('cb_access_documents_see').checked,
            analytics_see:    document.getElementById('cb_access_analytics_see').checked,
            market_see:    document.getElementById('cb_access_market_see').checked,
            settings_manage: document.getElementById('cb_access_settings_manage').checked,
        }


        sendRequest('post', 'set_user_accesses', data)
            .then(data => {
                document.getElementById('header_create_company_user').innerText = "Chat rules"
                document.getElementById('div_company_user_access').style.display = 'none'
                document.getElementById('div_company_user_chat').style.display = 'block'
                showNotify("Saved")
            })
            .catch(err => console.log(err))
    })
    document.getElementById('btn_company_user_next_3').addEventListener('click', function(){
        const div_users_for_obligatory_copy = document.getElementById('div_obligatory_copy')
        let copy_to = []
        Array.from(div_users_for_obligatory_copy.getElementsByClassName("user_for_obligatory_copy")).forEach(function(element) {
            if (element.classList.contains("active")) {
                copy_to.push(parseInt(element.getAttribute("data-user-id")))
            }
        })

        let data = {
            user_id: company_user_id,
            copy_to: copy_to
        }


        sendRequest('post', 'set_user_chat_rules', data)
            .then(data => {
                document.getElementById('header_create_company_user').innerText = "Set user avatar"
                document.getElementById('div_company_user_chat').style.display = 'none'
                document.getElementById('div_company_user_avatar').style.display = 'block'
                showNotify("Saved")
            })
            .catch(err => console.log(err))
    })
    document.getElementById('company_user_avatar_edit').addEventListener('click', function(){
        document.getElementById('input_company_user_avatar').click()
    })
    document.getElementById('company_user_avatar').addEventListener('click', function(){
        document.getElementById('input_company_user_avatar').click()
    })
    document.getElementById('input_company_user_avatar').onchange = function(){

        const formData = new FormData();
        const file_name = this.files[0].name
        const file_value = document.getElementById('input_company_user_avatar');
        console.log("supply_set_document change ", file_name)
        console.log("file_value.files[0] ", file_value.files[0])
        formData.append('user_id', company_user_id);
        formData.append('file_name', file_name);
        formData.append('token',     cookie_token)
        formData.append('file', file_value.files[0])

        if (file_value.files.length == 0) {
            showAlert("Select file")
            return;
        }

        var fr = new FileReader();
        fr.onload = function () {
            document.getElementById('company_user_avatar_edit').src = fr.result;
        }
        fr.readAsDataURL(file_value.files[0]);

        fetch(api_url + 'update_company_user_avatar', {
            method: 'PUT',
            body: formData
        })
            .then((response) => response.json())
            .then((data) => {
                current_buyer = data
                showNotify("Avatar updated")
                setCustomerUsers(data.users)

                if (document.querySelector('[data-popup-name="create_company_user"]').style.display == 'flex') {
                    closePopup()
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });

    }

    function editCompanyUser(){
        showPopup("edit_company_user")
        document.getElementById('set_access_to_projects_edit').style.display = current_buyer.buyer_info.show_projects ? 'flex' : 'none'

        document.querySelector(`.company_user_filters[data-key="base"]`).click()
        company_user_id = parseInt(this.parentElement.getAttribute('data-user-id'))

        if (company_user_phone_edit != null) {company_user_phone_edit.destroy()}

        const input = document.querySelector("#company_user_phone_edit");
        company_user_phone_edit = window.intlTelInput(input, {
            // any initialisation options go here
            autoHideDialCode: false,
            separateDialCode: true,
            utilsScript: "../libs/input_phone/utils.js",
        })

        company_user_for_edit = current_buyer.users.filter(user => { if (user.id == company_user_id) { return user }})[0]


        document.getElementById('company_user_firstname_edit').value = company_user_for_edit.first_name
        document.getElementById('company_user_surname_edit')  .value = company_user_for_edit.surname
        document.getElementById('company_user_position_edit') .value = company_user_for_edit.position
        document.getElementById('company_user_email_edit')    .value = company_user_for_edit.email
        company_user_phone_edit.setNumber(`+${company_user_for_edit.phone}`)

        console.log("access ", company_user_for_edit.access)

        let accesses = company_user_for_edit.access
        document.getElementById('cb_access_products_see_edit')   .checked = accesses.products_see
        document.getElementById('cb_access_products_manage_edit').checked = accesses.products_manage
        document.getElementById('cb_access_orders_see_edit')     .checked = accesses.orders_see
        document.getElementById('cb_access_orders_manage_edit')  .checked = accesses.orders_manage
        document.getElementById('cb_access_projects_see_edit')   .checked = accesses.projects_see
        document.getElementById('cb_access_projects_manage_edit').checked = accesses.projects_manage
        document.getElementById('cb_access_documents_see_edit')   .checked = accesses.documents_see
        document.getElementById('cb_access_analytics_see_edit')   .checked = accesses.analytics_see
        document.getElementById('cb_access_market_see_edit')     .checked = accesses.market_see
        document.getElementById('cb_access_suppliers_see_edit')  .checked = accesses.suppliers_see
        document.getElementById('cb_access_settings_manage_edit').checked = accesses.settings_manage


        document.getElementById('company_user_avatar_edit').setAttribute("src", company_user_for_edit.avatar)


        setObligatoryCopy()

        function setObligatoryCopy() {
            let html = ''
            current_buyer.users.forEach(user => {
                if (user.id == company_user_for_edit.id) { return }

                let active_class = ''
                if (company_user_for_edit.ticket_copy_to.includes(user.id)){
                    active_class = 'active'
                }

                html += `<div data-user-id="${user.id}" class="user_for_obligatory_copy ${active_class}">
                            <img src="${user.avatar}"/>
                            <div>${user.name}</div>
                         </div>`
            })
            const div_users_for_obligatory_copy = document.getElementById('div_obligatory_copy_edit')
            div_users_for_obligatory_copy.innerHTML = html
            Array.from(div_users_for_obligatory_copy.getElementsByClassName("user_for_obligatory_copy")).forEach(function(element) {
                element.addEventListener('click', addUserForObligatoryCopy );
            })
            function addUserForObligatoryCopy(){
                if (this.classList.contains("active")) {
                    this.classList.remove("active")
                } else {
                    this.classList.add("active")
                }
            }
        }

    }
    document.getElementById('btn_save_user_changes').addEventListener('click', function(){
        if (!company_user_phone_edit.isValidNumber()) {
            showAlert("Invalid phone number format")
            return
        }

        let copy_to = []
        const div_users_for_obligatory_copy = document.getElementById('div_obligatory_copy_edit')
        Array.from(div_users_for_obligatory_copy.getElementsByClassName("user_for_obligatory_copy")).forEach(function(element) {
            if (element.classList.contains("active")) {
                copy_to.push(parseInt(element.getAttribute("data-user-id")))
            }
        })


        let data = {
            user_id: company_user_for_edit.id,
            ticket_copy_to: copy_to,

            info: {
                name:     document.getElementById('company_user_firstname_edit').value,
                surname:  document.getElementById('company_user_surname_edit')  .value,
                position: document.getElementById('company_user_position_edit') .value,
                email:    document.getElementById('company_user_email_edit')    .value,
                phone_full:    company_user_phone_edit.getNumber(),
                phone_country: company_user_phone_edit.getSelectedCountryData().dialCode
            },

            accesses: {
                products_see:    document.getElementById('cb_access_products_see_edit')   .checked,
                products_manage: document.getElementById('cb_access_products_manage_edit').checked,
                orders_see:      document.getElementById('cb_access_orders_see_edit')     .checked,
                orders_manage:   document.getElementById('cb_access_orders_manage_edit')  .checked,
                projects_see:    document.getElementById('cb_access_projects_see_edit')   .checked,
                projects_manage: document.getElementById('cb_access_projects_manage_edit').checked,
                documents_see:   document.getElementById('cb_access_documents_see_edit')   .checked,
                analytics_see:   document.getElementById('cb_access_analytics_see_edit')   .checked,
                market_see:      document.getElementById('cb_access_market_see_edit')     .checked,
                suppliers_see:   document.getElementById('cb_access_suppliers_see_edit')  .checked,
                settings_manage: document.getElementById('cb_access_settings_manage_edit').checked,
            }
        }

        if (data.name == "" || data.surname == "" || data.email == "" || data.phone_full == ""){
            showAlert("Fill in all personal fields")
            return
        }


        sendRequest('post', 'update_buyer_user', data)
            .then(data => {
                current_buyer = data
                setCustomerUsers(data.users)
                closePopup()
                showNotify("Updated")
            })
            .catch(err => console.log(err))
    })


    let manufacturer_user_phone_edit = null
    let manufacturer_user_phone = null
    let manufacturer_user_id    = null
    let manufacturer_user_for_edit    = null

    Array.from(document.querySelectorAll(".manufacturer_user_filters")).forEach(function(element) {
        element.addEventListener('click', filterManufacturerUser );
    });
    function filterManufacturerUser(){
        Array.from(document.querySelectorAll(".manufacturer_user_filters")).forEach(function(element) {
            element.classList.remove('active')
        });
        this.classList.add("active")

        Array.from(document.querySelectorAll(".div_manufacturer_user")).forEach(function(element) {
            element.style.display = 'none'
        });
        document.getElementById(`div_manufacturer_user_${this.getAttribute("data-key")}_edit`).style.display = 'block'
    }
    function editManufacturerUser(){
        showPopup("edit_manufacturer_user")
        document.querySelector(`.manufacturer_user_filters[data-key="base"]`).click()
        manufacturer_user_id = parseInt(this.parentElement.getAttribute('data-user-id'))

        const input = document.querySelector("#manufacturer_user_phone_edit");
        manufacturer_user_phone_edit = window.intlTelInput(input, {
            // any initialisation options go here
            autoHideDialCode: false,
            separateDialCode: true,
            utilsScript: "../libs/input_phone/utils.js",
        })

        manufacturer_user_for_edit = main_data.manufacturer_users.filter(user => { if (user.id == manufacturer_user_id) { return user }})[0]


        document.getElementById('manufacturer_user_firstname_edit').value = manufacturer_user_for_edit.first_name
        document.getElementById('manufacturer_user_surname_edit')  .value = manufacturer_user_for_edit.surname
        document.getElementById('manufacturer_user_position_edit') .value = manufacturer_user_for_edit.position
        document.getElementById('manufacturer_user_email_edit')    .value = manufacturer_user_for_edit.email
        manufacturer_user_phone_edit.setNumber(`+${manufacturer_user_for_edit.phone}`)

        console.log("manufacturer_user_for_edit ", manufacturer_user_for_edit)
        console.log("access ", manufacturer_user_for_edit.access)

        let accesses = manufacturer_user_for_edit.access
        document.getElementById('cb_manufacturer_access_products_see_edit')   .checked = accesses.products_see
        document.getElementById('cb_manufacturer_access_products_manage_edit').checked = accesses.products_manage
        document.getElementById('cb_manufacturer_access_orders_see_edit')     .checked = accesses.orders_see
        document.getElementById('cb_manufacturer_access_orders_manage_edit')  .checked = accesses.orders_manage
        document.getElementById('cb_manufacturer_access_projects_see_edit')   .checked = accesses.projects_see
        document.getElementById('cb_manufacturer_access_projects_manage_edit').checked = accesses.projects_manage
        document.getElementById('cb_manufacturer_access_planning_see_edit')   .checked = accesses.planning_see
        document.getElementById('cb_manufacturer_access_planning_manage_edit').checked = accesses.planning_manage
        document.getElementById('cb_manufacturer_access_price_approval_manage_edit').checked = accesses.price_approval_manage
        document.getElementById('cb_manufacturer_access_customers_manage_edit').checked = accesses.customers_manage
        document.getElementById('cb_manufacturer_access_analytics_see_edit')   .checked = accesses.analytics_see
        document.getElementById('cb_manufacturer_access_market_see_edit')     .checked = accesses.market_see
        document.getElementById('cb_manufacturer_access_settings_manage_edit').checked = accesses.settings_manage


        document.getElementById('manufacturer_user_avatar_edit').setAttribute("src", manufacturer_user_for_edit.avatar)


        setObligatoryCopy()
        setRegions()

        function setRegions() {

            let html = ''
            main_data.lists_data.regions.forEach(region => {
                let active_class = ''
                if (manufacturer_user_for_edit.regions.split(",").includes(region)){
                    active_class = 'active'
                }

                html += `<div data-region="${region}" class="manufacturer_user_regions ${active_class}">
                            <div>${region}</div>
                         </div>`
            })
            const manufacturer_user_regions = document.getElementById('manufacturer_user_regions_edit')
            manufacturer_user_regions.innerHTML = html
            Array.from(manufacturer_user_regions.getElementsByClassName("manufacturer_user_regions")).forEach(function(element) {
                element.addEventListener('click', addRegionForUser );
            })
            function addRegionForUser(){
                if (this.classList.contains("active")) {
                    this.classList.remove("active")
                } else {
                    this.classList.add("active")
                }
            }
        }

        function setObligatoryCopy() {
            let html = ''
            main_data.manufacturer_users.forEach(user => {
                if (user.id == manufacturer_user_for_edit.id) { return }

                let active_class = ''
                if (manufacturer_user_for_edit.ticket_copy_to.includes(user.id)){
                    active_class = 'active'
                }

                html += `<div data-user-id="${user.id}" class="user_for_obligatory_copy ${active_class}">
                            <img src="${user.avatar}"/>
                            <div>${user.name}</div>
                         </div>`
            })
            const div_users_for_obligatory_copy = document.getElementById('manufacturer_obligatory_copy_edit')
            div_users_for_obligatory_copy.innerHTML = html
            Array.from(div_users_for_obligatory_copy.getElementsByClassName("user_for_obligatory_copy")).forEach(function(element) {
                element.addEventListener('click', addUserForObligatoryCopy );
            })
            function addUserForObligatoryCopy(){
                if (this.classList.contains("active")) {
                    this.classList.remove("active")
                } else {
                    this.classList.add("active")
                }
            }
        }
    }
    document.getElementById('btn_save_manufacturer_user_changes').addEventListener('click', function(){
        if (!manufacturer_user_phone_edit.isValidNumber()) {
            showAlert("Invalid phone number format")
            return
        }

        let copy_to = []
        const div_users_for_obligatory_copy = document.getElementById('manufacturer_obligatory_copy_edit')
        Array.from(div_users_for_obligatory_copy.getElementsByClassName("user_for_obligatory_copy")).forEach(function(element) {
            if (element.classList.contains("active")) {
                copy_to.push(parseInt(element.getAttribute("data-user-id")))
            }
        })

        let regions = []
        const div_user_regions = document.getElementById('manufacturer_user_regions_edit')
        Array.from(div_user_regions.getElementsByClassName("manufacturer_user_regions")).forEach(function(element) {
            if (element.classList.contains("active")) {
                regions.push(element.getAttribute("data-region"))
            }
        })


        let data = {
            user_id: manufacturer_user_for_edit.id,
            ticket_copy_to: copy_to,
            regions: regions,

            info: {
                name:     document.getElementById('manufacturer_user_firstname_edit').value,
                surname:  document.getElementById('manufacturer_user_surname_edit')  .value,
                position: document.getElementById('manufacturer_user_position_edit') .value,
                email:    document.getElementById('manufacturer_user_email_edit')    .value,
                phone_full:    manufacturer_user_phone_edit.getNumber(),
                phone_country: manufacturer_user_phone_edit.getSelectedCountryData().dialCode
            },

            accesses: {
                products_see:     document.getElementById('cb_manufacturer_access_products_see_edit')   .checked,
                products_manage:  document.getElementById('cb_manufacturer_access_products_manage_edit').checked,
                orders_see:       document.getElementById('cb_manufacturer_access_orders_see_edit')     .checked,
                orders_manage:    document.getElementById('cb_manufacturer_access_orders_manage_edit')  .checked,
                projects_see:     document.getElementById('cb_manufacturer_access_projects_see_edit')   .checked,
                projects_manage:  document.getElementById('cb_manufacturer_access_projects_manage_edit').checked,
                planning_see:     document.getElementById('cb_manufacturer_access_planning_see_edit').checked,
                planning_manage:  document.getElementById('cb_manufacturer_access_planning_manage_edit').checked,
                price_approval_manage: document.getElementById('cb_manufacturer_access_price_approval_manage_edit').checked,
                customers_manage: document.getElementById('cb_manufacturer_access_customers_manage_edit').checked,
                analytics_see:    document.getElementById('cb_manufacturer_access_analytics_see_edit')   .checked,
                market_see:       document.getElementById('cb_manufacturer_access_market_see_edit')     .checked,
                settings_manage:  document.getElementById('cb_manufacturer_access_settings_manage_edit').checked,
            }
        }

        if (data.name == "" || data.surname == "" || data.email == "" || data.phone_full == ""){
            showAlert("Fill in all personal fields")
            return
        }


        //sendRequest('post', 'update_buyer_user', data)
        sendRequest('post', 'update_manufacturer_user', data)
            .then(data => {
                main_data.manufacturer_users = data.users
                setManufacturerUsers(data.users)
                closePopup()
                showNotify("Updated")
            })
            .catch(err => console.log(err))
    })



    ///// - MANAGE USERS ////







    ///// + MANAGE ACCESS ////

    function setAccesses(){
        if (user_status == "buyer") {
            setBuyerAccess(main_data.accesses)
        } else if (user_status == 'manufacturer') {
            setManufacturerAccess(main_data.accesses)
        }
    }
    function setManufacturerAccess(accesses){}
    function setBuyerAccess(accesses){
        let doc = document.querySelector('.client_container')
        console.log("doc " , doc)

        if (accesses.products_see == false){
            document.getElementById("nav_client_products").style.display = 'none'
        }
        if (accesses.products_manage == false){
            Array.from(doc.getElementsByClassName("cart_container")).forEach(function(element) {
                element.style.display = 'none'
            })
            Array.from(doc.getElementsByClassName("list-base-product")).forEach(function(element) {
                element.getElementsByClassName('counter')[0].style.display = 'none'
                element.getElementsByClassName('btns_to_cart')[0].style.display = 'none'
                element.getElementsByClassName('product_price')[0].style.display = 'none !important'
            })
        }

        if (accesses.orders_see == false){
            document.getElementById("nav_client_orders").style.display = 'none'
            document.getElementById("nav_client_desktop").style.display = 'none'
            document.getElementById("nav_client_chats").lastElementChild.click()
        }
        if (accesses.orders_manage == false){
            document.getElementById("btn_create_supply_buyer").style.display = 'none'
            Array.from(doc.getElementsByClassName("btns_delete_order")).forEach(function(element) {
                element.style.display = 'none'
            })
        }

        if (accesses.projects_see == false){
            document.getElementById("nav_client_projects").style.display = 'none'
            Array.from(doc.getElementsByClassName("project_element")).forEach(function(element) {
                element.style.display = 'none'
            })
        }

        if (accesses.projects_manage == false){
            document.getElementById(`btn_project_create`).style.display = 'none'
            document.getElementById('div_project_job_add').style.display = 'none'
            document.getElementById('btn_open_edit_project').style.display = 'none'
        }


        if (accesses.documents_see == false){
            Array.from(doc.querySelectorAll(".download_supply_documents")).forEach(function(element) {
                element.style.display = 'none'
            })
            Array.from(doc.querySelectorAll(".certificate.contract")).forEach(function(element) {
                element.style.display = 'none'
            })

        }
        if (accesses.analytics_see == false){
            document.getElementById("nav_client_analytics").style.display = 'none'
        }

        if (accesses.market_see == false){
            document.getElementById("nav_client_market").style.display = 'none'
        }

        if (accesses.suppliers_see == false){
            document.getElementById("nav_client_suppliers").style.display = 'none'
        }

        if (accesses.settings_manage == false){
            document.getElementById("nav_client_settings").style.display = 'none'
        }
    }

    ///// - MANAGE ACCESS ////









    ///// + MANAGE CREDIT ////

    async function updateDebtors(buyer_id){
        sendRequest('post', 'update_debtors', {buyer_id: buyer_id})
            .then(data => {
                setDebtors(data.debtors)
            })
            .catch(err => console.log(err))
    }
    function setDebtors(debtors){
        let div = document.getElementById("div_debtors")
        div.style.display = 'none'

        let html = ''
        debtors.forEach(function(item, i, arr) {
            html += getCreditUsedHTML(item)
            div.style.display = 'flex'
        })
        div.innerHTML = html
        initSteppedProgress()
    }
    function getCreditUsedHTML(item) {

        let bar_value = {"title": "Credit information",
            "show_legend": "false",
            "categories":
                [ { "name": `Used ${formatNum(item.credit_used)} USD`,
                    "value": item.credit_used,
                    "color": "linear-gradient(90deg, rgba(190,1,1,1) 0%, rgba(246,115,24,1) 100%, rgba(0,212,255,1) 100%)" },

                    { "name": `Available ${formatNum(item.credit_available)} USD`,
                        "value": item.credit_available,
                        "color": "linear-gradient(90deg, rgba(1,181,190,1) 0%, rgba(24,246,66,1) 100%, rgba(0,212,255,1) 100%)" } ]}


        let html = `
                  <div class="debtor_container">
                        <div class="debtor_info">
                            <span class="debtor_name">${item.buyer_name}</span>
                            <br>
                            used ${item.credit_used_percent}% of ${formatNum(item.credit_limit)} USD
                        </div>

                        <div class="debtor_bar"  data-stepped-bar='${JSON.stringify(bar_value)}'></div>

                    </div>
            `
        return html
    }

    function setCreditLimit() {
        if (main_data.cabinet_info.credit_limit == 0) {
            return
        }

        let credit_available =  formatNum(main_data.cabinet_info.credit_available)
        if (main_data.cabinet_info.credit_available < 0) {
            credit_available = `<span class="red">${credit_available}</span>`
        }

        let text = `Credit information:  <br>
                    ${credit_available}
                    out of ${formatNum(main_data.cabinet_info.credit_limit)}
                    are available for you to use`

        // document.getElementById("order_credit_info").innerHTML = text


        document.getElementById("div_workspace_credit").style.display = 'block'
        let value = `{
        "title": "Credit information",
        "show_legend": "true",

        "categories":
        [ { "name": "Used ${formatNum(main_data.cabinet_info.credit_used)} USD",
            "value": ${main_data.cabinet_info.credit_used},
            "color": "linear-gradient(90deg, rgba(190,1,1,1) 0%, rgba(246,115,24,1) 100%, rgba(0,212,255,1) 100%)" },

          { "name": "Available ${formatNum(main_data.cabinet_info.credit_available)} USD",
            "value": ${main_data.cabinet_info.credit_available},
            "color": "linear-gradient(90deg, rgba(1,181,190,1) 0%, rgba(24,246,66,1) 100%, rgba(0,212,255,1) 100%)" } ]}`
        document.getElementById('workspace_credit_total').innerText = `Credit limit: ${formatNum(main_data.cabinet_info.credit_limit)} USD`
        document.getElementById('workspace_credit_bar').setAttribute("data-stepped-bar", value)
        initSteppedProgress();




    }
    function setCustomerCredit(item){
        let html = getCreditUsedHTML(item)
        let div = document.getElementById("div_buyer_credit_limit")
        div.style.display = 'flex'
        div.innerHTML = html

        div.getElementsByClassName("debtor_name")[0].innerText = 'Credit limit'

        const debtor_info = div.getElementsByClassName("debtor_info")[0]
        debtor_info.addEventListener('click', () => {showPopup("edit_credit_limit")} )
        debtor_info.setAttribute("data-tippy-content", "Click to change")

        initSteppedProgress()

        tippy('.debtor_info', {
            followCursor: 'horizontal',
            animation: 'fade',
        });
    }
    document.getElementById('btn_save_credit_limit').addEventListener('click', function (evt) {
        let buyer_id = this.getAttribute("data-buyer-id")
        let credit_limit = document.getElementById('input_new_credit_limit').value
        if (credit_limit < 0) {

            showAlert("Credit limit must be more than 0")
            return;
        }

        sendRequest('post', 'update_credit_limit', {
            buyer_id: buyer_id,
            credit_limit: credit_limit})
            .then(data => {
                setCustomerCredit(data.buyer_info.cabinet_info)
                showNotify("Changes saved")
                closePopup()
                updateDebtors(buyer_id)
            })
            .catch(err => console.log(err))
    });

    ///// - MANAGE CREDIT ////










    ///// + MANUFACTURER SETTINGS ////

    Array.from(document.querySelectorAll(".manufacturer_info_filters")).forEach(function(element) {
        element.addEventListener('click', filterManufacturerSettings );
    });
    function filterManufacturerSettings(){
        Array.from(document.querySelectorAll(".manufacturer_info_filters")).forEach(function(element) {
            element.classList.remove('active')
        });
        this.classList.add("active")

        Array.from(document.querySelectorAll(".div_manufacturer_info")).forEach(function(element) {
            element.style.display = 'none'
        });
        document.getElementById(`div_manufacturer_${this.getAttribute("data-key")}`).style.display = 'flex'
    }
    function setManufacturerIncoterms(data) {
        let result = ''

        data.forEach(function(incoterm, i) {
            let num = i + 1
            if (num < 10) { num = `00${num}`}
            else if (num < 100) {num = `0${num}`}

            let row = `<div class="list-order-admin visible" data-incoterm-id="${incoterm.id}" >
                           <div class="text_info">
                               <div class="name">
                                   <img class="country_flag" data-tippy-content="Incoterm country" src="img/flags/${incoterm.country_code}.svg">
                                   <div class="order_info">
                                       <div>${incoterm.incoterm_name}</div>
                                       <div class="details">${incoterm.country_name}, ${incoterm.region_name}</div>
                                   </div>
                               </div>
                           </div>

                          <div class="settings_info_block" data-tippy-content="Delivery time, days. Click to change">
                             <img class="settings_info_img" src="img/delivery_days.svg"/>
                             <img class="btn_save_incoterm_lead_time btn_save" src="img/save_small.svg" />
                             <input class="input_settings_incoterm_lead_time inputs" type="number" value="${incoterm.lead_time}" placeholder="0"/>
                          </div>
                          <div>
                             <div  class="settings_info_block" data-tippy-content="Delivery cost for 20ft container, USD. Click to change">
                                <img class="settings_info_img" src="img/container_20ft.svg"/>
                                <img class="btn_save_incoterm_price_20 btn_save" src="img/save_small.svg" />
                                <input class="input_settings_incoterm_price_20 inputs" type="number" data-first-value="${incoterm.price_20}" value="${incoterm.price_20}" placeholder="0"/>
                             </div>
                             <div  class="settings_info_block" data-tippy-content="Delivery cost for 40ft container, USD. Click to change">
                                <img class="settings_info_img" src="img/container_40ft.svg"/>
                                <img class="btn_save_incoterm_price_40 btn_save" src="img/save_small.svg" />
                                <input class="input_settings_incoterm_price_40 inputs" type="number" data-first-value="${incoterm.price_40}" value="${incoterm.price_40}" placeholder="0"/>
                             </div>
                          </div>
                        </div>`

            result += row
        })

        const table = document.getElementById('table_settings_delivery')
        table.innerHTML = result


        Array.from(table.getElementsByClassName("settings_info_block")).forEach(function(element) {
            element.addEventListener('click', editIncotermInfo )
        });
        function editIncotermInfo(){
            let btn_save = this.getElementsByClassName("btn_save")[0]
            let image    = this.getElementsByClassName("settings_info_img")[0]
            let input    = this.getElementsByClassName("inputs")[0]

            btn_save.style.display = 'block'
            image.style.display    = 'none'
            input.classList.add('edit')
            input.focus()
        }


        Array.from(table.getElementsByClassName("btn_save")).forEach(function(element) {
            element.addEventListener('click', saveIncotermInfo )
        });
        function saveIncotermInfo(e){
            e.preventDefault()
            e.stopPropagation()

            let btn_save = this.parentElement.getElementsByClassName("btn_save")[0]
            let image    = this.parentElement.getElementsByClassName("settings_info_img")[0]
            let input    = this.parentElement.getElementsByClassName("inputs")[0]

            if (parseInt(input.value) <= 0) {
                showAlert("New value must be greater than 0")
                return
            }


            btn_save.style.display = 'none'
            image.style.display    = 'block'
            input.classList.remove('edit')
            input.classList.add('edited')

            let body = {
                incoterm_id: this.parentElement.parentElement.parentElement.getAttribute("data-incoterm-id"),
                new_value:  input.value
            }

            let api_request = ''
            if (input.classList.contains('input_settings_incoterm_lead_time')) {
                api_request = 'set_incoterm_lead_time'
            } else if (input.classList.contains('input_settings_incoterm_price_20')) {
                api_request = 'set_incoterm_price_20'
            } else if (input.classList.contains('input_settings_incoterm_price_40')) {
                api_request = 'set_incoterm_price_40'
            }

            sendRequest("post", api_request, body)
                .then(data => {
                    showNotify("Changes saved")
                })
        }

    }

    let create_incoterm__country = null
    let create_incoterm__code = null
    function setCountriesForRegion(countries){
        let html = ''
        countries.forEach((item, i) => {
            html += `<option class="country_for_region" data-value="${item}">${item}</option>`
        })
        document.getElementById("first_country_in_region").innerHTML = html
        first_country_in_region = new vanillaSelectBox(
            "#first_country_in_region",
            {"maxHeight":300,
                search:true,
                translations : { "all": "All countries", "items": "countries"}
            })
    }
    function setCountriesForIncoterm(countries){
        let html = ''
        countries.forEach((item, i) => {
            html += `<option class="country_for_incoterm" data-value="${item}">${item}</option>`
        })
        document.getElementById("create_incoterm__country").innerHTML = html
        create_incoterm__country = new vanillaSelectBox(
            "#create_incoterm__country",
            {"maxHeight":300,
                search:true,
                translations : { "all": "All countries", "items": "countries"}
            })
    }
    function setCodesForIncoterm(countries){
        let html = ''
        countries.forEach((item, i) => {
            html += `<option class="code_for_incoterm" data-value="${item}">${item}</option>`
        })
        document.getElementById("create_incoterm__code").innerHTML = html
        create_incoterm__code = new vanillaSelectBox(
            "#create_incoterm__code",
            {"maxHeight":300,
                search:true,
                translations : { "all": "All countries", "items": "countries"}
            })
    }

    let incoterm_region = ''
    let create_incoterm_dd_region = null
    let first_country_in_region = null
    document.getElementById('btn_create_incoterm').addEventListener('click', function (evt) {
        create_incoterm__country.setValue('')
        create_incoterm__code.setValue('')

        incoterm_region = ''
        document.getElementById('create_incoterm_city').value          = ''

        document.getElementById('create_incoterm_lead_time').value     = ''
        document.getElementById('create_incoterm_price_20').value      = ''
        document.getElementById('create_incoterm_price_40').value      = ''

        showPopup("create_incoterm")
    });
    Array.from(document.getElementsByClassName("btns-incoterm-region")).forEach(function(element) {
        element.addEventListener('click', selectIncotermRegion );
    });
    function selectIncotermRegion(){
        incoterm_region = this.getAttribute("data-value")
        document.getElementById('create_incoterm_region').innerText = this.innerText

        create_incoterm_dd_region.close()
    }
    document.getElementById('btn_save_incoterm').addEventListener('click', function (evt) {

        let body = {
            country_name:  create_incoterm__country.getResult(),
            city_name:     document.getElementById('create_incoterm_city').value,
            incoterm_code: create_incoterm__code.getResult(),
            lead_time:     document.getElementById('create_incoterm_lead_time').value,
            price_20:      document.getElementById('create_incoterm_price_20').value,
            price_40:      document.getElementById('create_incoterm_price_40').value,
        }

        console.log("btn_save_incoterm ", body)
        if (body.country_name == '' || body.city_name == '' || body.incoterm_code == '' || body.lead_time == '' || body.price_20 == '' || body.price_40 == ''  ){
            showNotify("Please fill all fields")
            return
        }



        sendRequest("POST", "create_incoterm", body)
            .then(data => {
                if (data.error == ''){
                    setManufacturerIncoterms(data.incoterms)
                    closePopup()
                } else {
                    showNotify(data.error)
                }

            })
            .catch(err => console.log(err))
    });


    function setManufacturerRegions(data){
        user_regions = data.regions.join(",")
        main_data.lists_data.regions_and_countries = data
        main_data.lists_data.regions = data.regions
        createWorkspaceFilters(false)
        createBuyersFilters()
        createManufacturerAnalyticFilters()
        createPlanningMainFilters()

        let page_html = ''

        createRegionsSelector(data)
        drawRegionsHTML(data)


        function createRegionsSelector(data){
            let regions_html = ''
            data.regions.forEach(region => {
                if (region == null) {
                    return
                }
                regions_html += `<div class="new_country_region vertical_list_item" data-region="${region}">${region}</div>`
            })


            document.getElementById('div_country_region').innerHTML = regions_html
            Array.from(document.getElementsByClassName("new_country_region")).forEach(function(element) {
                element.addEventListener('click', saveCountryRegion)
            })

            function saveCountryRegion(){
                let country_id = this.parentElement.getAttribute("data-country-id")
                sendRequest('post', 'save_country_region', {country_id: country_id, region: this.getAttribute("data-region")})
                    .then(data => {
                        showNotify("Saved")
                        closePopup()
                        setManufacturerRegions(data.regions_and_countries)
                        setManufacturerIncoterms(data.incoterms)

                    })
                    .catch(err => console.log(err))
            }

        }


        function drawRegionsHTML(data){
            data.regions.forEach(region => {
                let countries = data.countries.filter(country => {
                    if (country.region_code == region ) {
                        return country
                    }
                })

                let region_name = region

                let countries_html = ''
                countries.forEach(country => {
                    countries_html += `<div class="horizontal_list_item change_country_region" data-country-id="${country.id}">
                                        <img src="img/flags/${country.country_code}.svg" />
                                        ${country.country_name}
                                   </div>`
                })


                let region_html = `<div class="workspace_container">
                                   <h2>${region_name}</h2>
                                   <div class="div_horizontal_list_items">${countries_html}</div>
                               </div>`
                page_html += region_html
            })

            document.getElementById('container_manufacturer_regions').innerHTML = page_html

            Array.from(document.getElementsByClassName("change_country_region")).forEach(function(element) {
                element.addEventListener('click', changeCountryRegion)
            });
            function changeCountryRegion(){
                document.getElementById('div_country_region').setAttribute("data-country-id", this.getAttribute("data-country-id"))
                showPopup("change_country_region")
            }
        }

    }
    document.getElementById('btn_create_region').addEventListener('click', function(){
        showPopup("create_region")
        first_country_in_region.setValue("")
    })
    document.getElementById('btn_save_region').addEventListener('click', function(){
        showPopup("create_region")
        let data = {country:     first_country_in_region.getResult(),
            region_code: document.getElementById('create_region_code_value').value}

        if (data.country == "" || data.region_code == "") {
            showAlert("Please fill all fields")
            return
        }

        sendRequest('post', 'create_region', data)
            .then(data => {
                showNotify("Saved")
                closePopup()
                setManufacturerRegions(data.regions_and_countries)
                setManufacturerIncoterms(data.incoterms)
            })
            .catch(err => console.log(err))
    })



    ///// - MANUFACTURER SETTINGS ////






    ///// + MANAGE FINANCIAL INFO ////

    let fin_fields = [
        'fin_iban',
        'fin_swift',
        'fin_currency',
        'fin_bank_name',
        'fin_bank_street',
        'fin_bank_number',
        'fin_bank_postcode',
        'fin_bank_town',
        'fin_country',
        'fin_comment'    ]
    function setFinanceInfo(for_whom, parent_page, info) {
        let parent = parent_page
        let organization_type = ''
        let organization_id    = ''
        if (for_whom == 'manufacturer_buyer') {

            organization_type = "manufacturer_buyer"
            organization_id   = info.id
        } else if (for_whom == "buyer") {
            organization_type = "buyer"
            organization_id   = info.id
        } else if (for_whom == "manufacturer") {
            organization_type = "manufacturer"
            organization_id   = info.id
        }

        let btn_save_fin = parent.getElementsByClassName('btn_save_fin')[0]
        btn_save_fin.setAttribute("data-organization-type", organization_type)
        btn_save_fin.setAttribute("data-organization-id",   organization_id)


        fin_fields.forEach((field) => {
            let field_dom = parent.getElementsByClassName(field)[0]
            field_dom.value = info[`${field}`]

            field_dom.addEventListener('change', () => {
                parent.querySelectorAll('.div_btns_save.fin')[0].style.display = 'flex'
                // window.scrollTo(10000, 10000)
            })
        })



    }
    Array.from(document.querySelectorAll(".btn_save_fin")).forEach(function(element) {
        element.addEventListener('click', saveFinInfo );
    });
    function saveFinInfo(){
        let btn_div = this.parentElement
        let parent = this.parentElement.parentElement
        let data = {
            organization_type: this.getAttribute("data-organization-type"),
            organization_id:   this.getAttribute("data-organization-id"),
            fin_iban:           parent.getElementsByClassName("fin_iban")         [0].value,
            fin_swift:          parent.getElementsByClassName("fin_swift")        [0].value,
            fin_currency:       parent.getElementsByClassName("fin_currency")     [0].value,
            fin_bank_name:      parent.getElementsByClassName("fin_bank_name")    [0].value,
            fin_bank_street:    parent.getElementsByClassName("fin_bank_street")  [0].value,
            fin_bank_number:    parent.getElementsByClassName("fin_bank_number")  [0].value,
            fin_bank_postcode:  parent.getElementsByClassName("fin_bank_postcode")[0].value,
            fin_bank_town:      parent.getElementsByClassName("fin_bank_town")    [0].value,
            fin_country:        parent.getElementsByClassName("fin_country")      [0].value,
            fin_comment:        parent.getElementsByClassName("fin_comment")      [0].value,
        }

        if (data.fin_iban === '' || data.fin_swift === '' || data.fin_currency === '' ||
            data.fin_bank_name === '' || data.fin_bank_street === '' || data.fin_bank_number === '' ||
            data.fin_bank_postcode === '' || data.fin_bank_town === '' || data.fin_country === '') {
            showAlert("Please fill all fields")
            return
        }

        fetch(
            `${api_url}save_fin`,
            { method: 'post',
                body: JSON.stringify(data),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                showNotify("Changes saved")
                btn_div.style.display = 'none'
                //window.location.reload()
            })
            .catch( error => console.error('error:', error) );

    }
    ///// - MANAGE FINANCIAL INFO ////








    ///// + MANAGE CUSTOMERS ////

    let filter_buyers_regions = null
    function createBuyersFilters(){
        let html = ''
        user_regions.split(",").forEach((item, i) => {
            html += `<option class="filter_buyers_regions" data-value="${item}">${item}</option>`
        })
        document.getElementById("filter_buyers_regions").innerHTML = html
        filter_buyers_regions = new vanillaSelectBox(
            "#filter_buyers_regions",
            {"maxHeight":300,
                search:true,
                translations : { "all": "All regions", "items": "regions"}
            })
    }
    let customers_filter = {regions: '', company: 'All customers'}
    Array.from(document.querySelectorAll(".btns-buyers-filter")).forEach(function(element) {
        element.addEventListener('click', changeBuyersFilter );
    });
    let hide = false
    function changeBuyersFilter(){
        let class_name = this.classList[2]
        let parent = this.parentElement.parentElement.parentElement.parentElement


        switch (class_name) {
            case "btns-buyers-regions":
                filter_dd_buyers_regions.close()
                customers_filter.regions = this.getAttribute("data-value")

                let region_text = ""
                if (this.getAttribute("data-value").split(",").length > 1){
                    region_text = " Regions"
                }

                document.getElementById('buyers_filter_region').innerText = this.innerText + region_text
                hide = true
                setBuyersFilterCompanies()
                break;
        }

        parent.classList.add("updated")


        let filter_customers = main_data.customers.filter(function(item){
            if (customers_filter.regions.split(",").includes(item.region)){
                return item;
            }
        })

        setCustomers(filter_customers)
    }
    function setBuyersFilterCompanies(){
        let filter_regions = customers_filter.regions.split(",")
        let customers = main_data.customers.filter((buyer) => {
            if (filter_regions.includes(buyer.region) ) {
                return buyer
            }
        })

        autocomplete(document.getElementById("buyers_filter_company"), customers.map(a => a.name), true, 'All customers');
    }




    function filterCustomers(){
        let filter_customers = main_data.customers.filter(function(item){
            if (customers_filter.company == item.name || customers_filter.company == ''){
                return item;
            }

        })
        document.getElementById('buyers_filter_company').parentElement.parentElement.parentElement.parentElement.classList.add('updated')
        setCustomers(filter_customers)
        checkPriceRequests()
    }
    function setCustomers(customers){
        //console.log("setAdminUsers ", users)
        let customers_list = document.getElementById("table_manufacturer_buyers")
        customers_list.innerHTML = ''
        customers.forEach(function(item, i, arr) {

            if (!customers_filter.regions.split(",").includes(item.region) ) {
                return
            }

            let cash = formatNum(parseInt(item.cash))
            let tons = formatNum(parseInt(item.tons))

            if (item.row_type == 'company') {
                customers_list.innerHTML += `
                    <div class="div_orders_block edit_buyer"  data-buyer-id="${item.id}" >
                        <div class="orders_header">
                            <div class="text-header">
                                <img src="img/achtung.svg" class="price_request" data-tippy-content="Customer requested price" />
                                ${item.name}
                            </div>

                            <div class="text-header">
                                <span class="section_mt"   data-tippy-content="YTD KG" >${tons} KG</span>
                                <span class="section_musd" data-tippy-content="YTD USD" >${cash} USD</span>
                            </div>
                        </div>
                    </div>`
            } else {
                if (item.tons != 0) {
                    customers_list.innerHTML += `
                    <div class="cutomers_region">
                        ${getRegionNameFromCode(item.row_name)}
                    </div>`
                }
            }
        })


        Array.from(customers_list.querySelectorAll(".edit_buyer")).forEach(function(element) {
            element.addEventListener('click', openCustomerInfo )
        });

        tippy(`#table_manufacturer_buyers .section_mt, #table_manufacturer_buyers .section_musd, .price_request `, {
            followCursor: 'horizontal',
            animation: 'fade',
        });
    }
    document.getElementById('btn_start_create_customer').addEventListener('click', function (evt) {
        document.getElementById("input_customer_name").value = ""
        showPopup("create_customer")
    });
    document.getElementById('btn_create_customer').addEventListener('click', function (evt) {
        let customer_name = document.getElementById("input_customer_name").value
        if (customer_name == ""){
            showAlert("Fill all fields")
            return
        }

        sendRequest('post', 'create_customer', {name: customer_name})
            .then(data => {
                closePopup()
                showCustomerInfo(data.buyer_id)
                setCustomers(data.customers)
            })
            .catch(err => console.log(err))

    });

    let current_buyer = null
    function openCustomerInfo(){
        showCustomerInfo(this.getAttribute("data-buyer-id"))
    }
    function showCustomerInfo(buyer_id) {
        sendRequest("post", 'get_manufacturer_buyer_info', {buyer_id: buyer_id})
            .then(data => {
                changeCurrentPage('manufacturer_buyer')
                Array.from(document.getElementsByClassName("div_manufacturer_buyers_info")).forEach(function(element) {
                    element.style.display = 'none'
                    if (element.id.includes("price_list")) {
                        element.style.display = 'flex'
                    }
                })


                console.log("manufacturer_buyer_info ", data)
                company_user_organization_info = {
                    organization_type: "buyer",
                    organization_id: data.buyer_info.id
                }
                current_buyer = data
                let page = document.getElementById('page_manufacturer_buyer')

                document.getElementById('header_buyer_info').style.display = 'block'
                document.getElementById('header_buyer_info').innerHTML = data.buyer_info.name

                document.getElementById('div_create_buyer_user').style.display = 'none'
                document.getElementById('btn_buyer_save_changes').style.display = 'flex'
                document.getElementById('div_buyers_users').style.display = 'block'
                document.getElementById('div_buyer_passwords').style.display = 'none'

                document.getElementById('btn_save_credit_limit').setAttribute("data-buyer-id", data.buyer_info.id)
                document.getElementById('btn_save_markup').setAttribute("data-buyer-id", data.buyer_info.id)
                document.getElementById('btn_buyer_save_changes').setAttribute("data-buyer-id", data.buyer_info.id)


                document.getElementById('buyer_markup_red').value   = parseFloat(data.buyer_info.markup_red).toFixed(2)
                document.getElementById('buyer_markup_yellow').value = parseFloat(data.buyer_info.markup_yellow).toFixed(2)
                document.getElementById('buyer_markup_green').value = parseFloat(data.buyer_info.markup_green).toFixed(2)
                document.getElementById('buyer_markup_white').value = parseFloat(data.buyer_info.markup_white).toFixed(2)





                setCustomerInfo(data)

                let parent_page = document.getElementById('page_manufacturer_buyer')


                setLangs("manufacturer_buyer", parent_page, data.cabinet_info)
                setGeo("manufacturer_buyer", parent_page, data.cabinet_info)

                setIndustries("manufacturer_buyer", parent_page, data.cabinet_info.industries)

                setCurrencies("manufacturer_buyer", parent_page, data.cabinet_info.currencies)
                setFinanceInfo("manufacturer_buyer", parent_page, data.buyer_info)

                setCustomerCredit(data.cabinet_info)

                setCustomerProducts(data.incoterms, data.products)
                setCustomerUsers(data.users)


            })
            .catch(err => console.log(err))
    }
    function setCustomerInfo(data){
        if (data.buyer_info.logo != null) {
            document.getElementById('cabinet_client_avatar').setAttribute("src", data.buyer_info.logo)
        }


        document.getElementById('buyer_show_projects')       .checked = data.buyer_info.show_projects
        document.getElementById('buyer_show_planning_graphs').checked = data.buyer_info.show_planning_graphs



        Array.from(document.getElementsByClassName("company_name")).forEach(function(element) {
            element.value = data.buyer_info.name
        })
        Array.from(document.getElementsByClassName("company_country")).forEach(function(element) {
            element.value = data.buyer_info.country
        })
        Array.from(document.getElementsByClassName("company_type")).forEach(function(element) {
            element.value = data.buyer_info.buyer_type
        })
        Array.from(document.getElementsByClassName("company_website")).forEach(function(element) {
            element.value = data.buyer_info.website
        })
        Array.from(document.getElementsByClassName("company_email")).forEach(function(element) {
            element.value = data.buyer_info.email
        })
        Array.from(document.getElementsByClassName("company_phone")).forEach(function(element) {
            element.value = "+380973143889"
        })



    }
    document.getElementById('div_buyer_avatar').onclick = function() {
        document.getElementById('input_buyer_avatar').click()
    }
    document.getElementById('div_buyer_set_logo').onclick = function() {
        document.getElementById('input_buyer_avatar').click()
    }
    document.getElementById('input_buyer_avatar').onchange = function() {
        const formData = new FormData();
        const file_name = this.files[0].name
        const file_value = document.getElementById('input_buyer_avatar')
        formData.append('buyer_id', company_user_organization_info.organization_id);
        formData.append('file_name', file_name);
        formData.append('token',     cookie_token)
        formData.append('file', file_value.files[0])

        if (file_value.files.length == 0) {
            showAlert("Select file")
            return
        }

        fetch(api_url + 'update_buyer_logo', {
            method: 'PUT',
            body: formData
        })
            .then((response) => response.json())
            .then((data) => {
                setCustomerInfo(data)
                if (user_status == "buyer") {
                    setLogo(data.buyer_info.logo)
                    document.getElementById('buyer_set_logo').setAttribute('src', data.buyer_info.logo)
                }

            })
            .catch((error) => {
                console.error('Error:', error);
            })
    }










    function setBuyerSettings(){
        sendRequest('post', 'get_buyer_settings_info', {})
            .then(data => {
                current_buyer = data
                company_user_organization_info = {
                    organization_type: "buyer",
                    organization_id:   data.buyer_info.id,
                }

                let parent_page = document.getElementById('page_settings')

                setBuyerInfo(data)

                setIndustries("buyer", parent_page, data.cabinet_info.industries)

                setLangs("buyer", parent_page, data.cabinet_info)
                setFinanceInfo("buyer", parent_page, data.buyer_info)
                setCustomerUsers(data.users)
                setBuyerPriceList()
            })
            .catch(err => console.log(err))
    }
    Array.from(document.querySelectorAll(".buyer_info_filters")).forEach(function(element) {
        element.addEventListener('click', filterBuyerInfo );
    });

    function filterBuyerInfo(){
        Array.from(document.querySelectorAll(".buyer_info_filters")).forEach(function(element) {
            element.classList.remove('active')
        });
        this.classList.add("active")

        Array.from(document.querySelectorAll(".div_buyers_info")).forEach(function(element) {
            element.style.display = 'none'
        });
        document.getElementById(`div_buyers_${this.getAttribute("data-key")}`).style.display = 'flex'
    }

    function setBuyerInfo(data){
        if (data.buyer_info.logo != null) {
            document.getElementById('buyer_set_logo').setAttribute("src", data.buyer_info.logo)
        }


        Array.from(document.getElementsByClassName("company_name")).forEach(function(element) {
            element.value = data.buyer_info.name
        })
        Array.from(document.getElementsByClassName("company_country")).forEach(function(element) {
            element.value = data.buyer_info.country
        })
        Array.from(document.getElementsByClassName("company_type")).forEach(function(element) {
            element.value = data.buyer_info.buyer_type
        })
        Array.from(document.getElementsByClassName("company_website")).forEach(function(element) {
            element.value = data.buyer_info.website
        })
        Array.from(document.getElementsByClassName("company_email")).forEach(function(element) {
            element.value = data.buyer_info.email
        })
        Array.from(document.getElementsByClassName("company_phone")).forEach(function(element) {
            element.value = data.buyer_info.phone
        })
    }


    function setBuyerPriceList(){
        let products = main_data.products.filter(item => {
            return item.manufacturer_id == buyer_manufacturer.id
        })
        let incoterms = main_data.incoterms.filter(item => {
            return item.manufacturer_id == buyer_manufacturer.id
        })

        const header = document.getElementById('table_header_buyer_price_list')
        const table  = document.getElementById('table_content_buyer_price_list')

        header.style.display = 'flex'
        table.style.display = 'block'
        let active_incoterms = []
        let headers = ''
        incoterms.forEach(function(item) {
            headers += `<div class="div_price_cell"   >
                                <div class="price_header" data-incoterm="${item.incoterm_name}"  data-tippy-content="${item.incoterm_name}">

                                    <img src="img/flags/${item.country_code}.svg" />
                                     ${item.incoterm_name.substring(0,6)}
                                </div>
                            </div>`
            active_incoterms.push(item.incoterm_name)
        });


        header.innerHTML = `<div class="div_price_list_search">
                              <div style="position: relative;">
                                  <img   class="input_search_icon" src="img/search_product.svg"/>
                                  <input class="price_list_search text_input_style" placeholder="Search products" />
                                 </div>
                             </div>`
        header.innerHTML += `${headers}`



        let body = ''
        products.forEach(function(product) {
            let prices = ``
            active_incoterms.forEach(function(incoterm) {
                const price = typeof product[`price_${incoterm}`] == 'undefined' || product[`price_${incoterm}`] == 0  ? '' : parseFloat(product[`price_${incoterm}`]).toFixed(2)

                prices += `<div class="div_price_cell"  data-product-id="${product.id}"  data-incoterm="${incoterm}" >
                                       <div class="div_in_table">
                                           <div class="input_buyer_product_price price_history_show">${price}</div>
                                        </div>
                                    </div>`
            })

            if (product.selected){
                body += `<div class="div_buyer_product_row">
                            <div class="div_product_cell">${product.name}</div>
                            ${prices}
                         </div>`
            }
        })


        table.innerHTML = body


        Array.from(table.getElementsByClassName("div_product_cell")).forEach(function(element) {
            let prices_cells = element.parentElement.getElementsByClassName('div_price_cell')

            element.onmouseover = function(e) {
                element.classList.add("hovered")
                Array.from(prices_cells).forEach(function(cell) {
                    cell.classList.add("hovered")
                })
            }
            element.onmouseout  = function(e) {
                element.classList.remove("hovered")
                Array.from(prices_cells).forEach(function(cell) {
                    cell.classList.remove("hovered")
                })
            }
        })


        Array.from(table.getElementsByClassName("div_price_cell")).forEach(function(element) {
            let product_cell  = element.parentElement.getElementsByClassName('div_product_cell')[0]
            let btn_add_price = element.getElementsByClassName("btn_add_buyer_price")[0]
            let incoterm_code = element.getAttribute("data-incoterm")
            // console.log("incoterm_code ", incoterm_code)
            // console.log("header 1", header.querySelectorAll(`.price_header[data-incoterm="${incoterm_code}"]`))
            // console.log("header 2", header.querySelectorAll(`.price_header [data-incoterm="${incoterm_code}"]`))
            let head = header.querySelectorAll(`.price_header[data-incoterm="${incoterm_code}"]`)[0].parentElement


            element.onmouseover = function(e) {
                element.classList.add("hovered")
                product_cell.classList.add("hovered")
                head.classList.add("hovered")
                if (typeof btn_add_price != 'undefined') { btn_add_price.style.visibility = 'visible' }
            }
            element.onmouseout  = function(e) {
                element.classList.remove("hovered")
                product_cell.classList.remove("hovered")
                head.classList.remove("hovered")
                if (typeof btn_add_price != 'undefined') { btn_add_price.style.visibility = 'hidden' }
            }
        })
        Array.from(header.getElementsByClassName("price_list_search")).forEach(function(element) {
            element.addEventListener('input', function(){

                let search = this.value.toLowerCase()
                console.log("price_list_search ", search)
                console.log("table.getElementsByClassName('div_buyer_product_row') ", table.getElementsByClassName('div_buyer_product_row'))
                Array.from(table.getElementsByClassName('div_product_cell')).forEach(row_item => {

                    console.log("row_item.firstChild innerText ", row_item)
                    console.log("row_item.firstChild innerText ", row_item.innerText)

                    let product_name = row_item.innerText.toLowerCase()

                    let show = false
                    if (product_name.includes(search) || search == "") {
                        show = true
                    }

                    row_item.parentElement.style.display = show ? "flex" : "none"
                })
            })
        })



        tippy('.price_header', {
            content: 'My tooltip!',
            followCursor: 'horizontal',
            animation: 'fade',
        });

    }
    const price_changes_value = document.getElementById('price_changes_value')
    const price_changes_percent = document.getElementById('price_changes_percent')
    const btn_change_price = document.getElementById('btn_change_price')
    let change_prices_values = []
    let change_buyer_price_input = null
    let change_buyer_price_parent = null
    function setCustomerProducts(incoterms, products){

        console.log("setCustomerProducts incoterms", incoterms)
        console.log("setCustomerProducts products", products)
        const header = document.getElementById('table_header_buyer_products')
        const table  = document.getElementById('table_content_buyer_products')

        header.style.display = 'flex'
        table.style.display = 'block'
        let active_incoterms = []
        let headers = ''
        incoterms.forEach(function(item) {
            headers += `<div class="div_price_cell"   >
                                <div class="price_header" data-incoterm="${item.incoterm_name}"  data-tippy-content="${item.incoterm_name}">

                                    <img src="img/flags/${item.country_code}.svg" />
                                     ${item.incoterm_name.substring(0,6)}
                                </div>
                            </div>`
            active_incoterms.push(item.incoterm_name)
        });

        header.innerHTML = `<div class="div_product_cell" style="visibility: hidden"></div>${headers}`



        let body = ''
        products.forEach(function(product) {
            let prices = ``
            active_incoterms.forEach(function(incoterm) {
                const price = typeof product[`price_${incoterm}`] == 'undefined' || product[`price_${incoterm}`] == 0  ? '' : parseFloat(product[`price_${incoterm}`]).toFixed(2)
                const btn_add_price = price == '' ? `<img class="btn_add_buyer_price" src="img/edit.svg" data-tippy-content="Add price"/>` : ""

                let price_color = product[`price_${incoterm}_color`]
                const alert = product[`price_${incoterm}_alert`]   ? `<img src="img/achtung.svg" class="price_alert"        data-tippy-content="Customer requested this price"/>` : ""
                prices += `<div class="div_price_cell ${price_color}"  data-product-id="${product.id}"  data-incoterm="${incoterm}" >
                                       <div class="div_in_table">
                                           ${alert}

                                           <div class="input_buyer_product_price price_history_show" data-tippy-content="See history and change price">${price}</div>
                                           ${btn_add_price}
                                        </div>
                                    </div>`
            })

            body += `<div class="div_buyer_product_row">
                        <div class="div_product_cell">
                            <label class="cl-switch">
                              <input data-product-id="${product.id}"  class="buyer_product_checkbox" type="checkbox" ${product.selected ? 'checked' : ''}>
                              <span class="switcher"></span>
                              <span class="label">${product.name}</span>
                            </label>
                            <!--<img class="btn_edit_buyer_state" src="img/edit.svg" />-->

                        </div>

                        ${prices}
                     </div>`
        });

        table.innerHTML = body



        Array.from(table.getElementsByClassName("div_product_cell")).forEach(function(element) {
            let prices_cells = element.parentElement.getElementsByClassName('div_price_cell')

            element.onmouseover = function(e) {
                element.classList.add("hovered")
                Array.from(prices_cells).forEach(function(cell) {
                    cell.classList.add("hovered")
                })
            }
            element.onmouseout  = function(e) {
                element.classList.remove("hovered")
                Array.from(prices_cells).forEach(function(cell) {
                    cell.classList.remove("hovered")
                })
            }
        })


        Array.from(table.getElementsByClassName("div_price_cell")).forEach(function(element) {
            let product_cell  = element.parentElement.getElementsByClassName('div_product_cell')[0]
            let btn_add_price = element.getElementsByClassName("btn_add_buyer_price")[0]
            let incoterm_code = element.getAttribute("data-incoterm")
            // console.log("incoterm_code ", incoterm_code)
            // console.log("header 1", header.querySelectorAll(`.price_header[data-incoterm="${incoterm_code}"]`))
            // console.log("header 2", header.querySelectorAll(`.price_header [data-incoterm="${incoterm_code}"]`))
            let head = header.querySelectorAll(`.price_header[data-incoterm="${incoterm_code}"]`)[0].parentElement


            element.onmouseover = function(e) {
                element.classList.add("hovered")
                product_cell.classList.add("hovered")
                head.classList.add("hovered")
                if (typeof btn_add_price != 'undefined') { btn_add_price.style.visibility = 'visible' }
            }
            element.onmouseout  = function(e) {
                element.classList.remove("hovered")
                product_cell.classList.remove("hovered")
                head.classList.remove("hovered")
                if (typeof btn_add_price != 'undefined') { btn_add_price.style.visibility = 'hidden' }
            }
        })





        Array.from(table.getElementsByClassName("price_history_show")).forEach(function(element) {
            element.addEventListener('click', showPriceDetails )

        });
        //Array.from(table.getElementsByClassName("btn_edit_buyer_state")).forEach(function(element) {
        //    element.addEventListener('click', changeBuyerProductState )
        //});
        Array.from(table.getElementsByClassName("btn_add_buyer_price")).forEach(function(element) {
            element.addEventListener('click', showPriceDetails )
        });


        //Array.from(table.getElementsByClassName("cl-switch")).forEach(function(element) {
        //    element.addEventListener('click', clickBuyerProductState);
        //});
        Array.from(table.getElementsByClassName("buyer_product_checkbox")).forEach(function(element) {
            element.addEventListener('change', saveBuyerProductState )
        });


        tippy('.btn_add_buyer_price, .price_header, .price_alert, .price_history_show', {
            content: 'My tooltip!',
            followCursor: 'horizontal',
            animation: 'fade',
        });

    }
    function saveBuyerProductState(){
        const body = {
            product_id: this.getAttribute("data-product-id"),
            state: this.checked
        }

        sendRequest("post", 'set_buyer_product_state', body)
            .then(data => {
                if (body.state) {
                    showNotify("Product activated")
                } else {
                    showNotify("Product deactivated")
                }

            })
    }
    function showPriceDetails(){
        let parent = this.parentElement.parentElement
        btn_change_price.setAttribute("data-product-id", parent.getAttribute("data-product-id"))
        btn_change_price.setAttribute("data-incoterm",   parent.getAttribute("data-incoterm"))

        price_changes_value.value   = ""
        price_changes_percent.value   = ""
        document.getElementById('price_changes_comment').value = ""

        change_buyer_price_parent = parent
        change_buyer_price_input  = parent.getElementsByClassName('input_buyer_product_price')[0]

        let price_history_table     = document.getElementById('price_history_table')
        let btn_change_actual_price = document.getElementById('btn_change_actual_price')
        let div_change_price        = document.getElementById('div_change_price')

        if (this.classList.contains('price_history_show')) {
            price_history_table    .style.display = 'block'
            btn_change_actual_price.style.display = 'block'
            div_change_price       .style.display = 'none'
        } else {
            price_history_table    .style.display = 'none'
            btn_change_actual_price.style.display = 'none'
            div_change_price       .style.display = 'block'
        }

        console.log("change_buyer_price_input ", change_buyer_price_input)

        sendRequest("post", 'get_price_history', {
            product_id: parent.getAttribute("data-product-id"),
            incoterm: parent.getAttribute("data-incoterm")
        })
            .then(data => {
                showPopup("price_history")
                let html = ''

                data.history_points.forEach(function(element) {
                    html += `
                            <div class="row">
                                    <div class="cell_value date">${element.date}</div>
                                    <div class="cell_value price">${element.price.toFixed(2)} ${element.currency}</div>
                                    <div class="cell_value comment">${element.comment}</div>
                            </div>`
                });

                document.getElementById('price_history_table').innerHTML = html


                document.getElementById('buyer_product_base_price_name').innerText = `Base price for ${data.product_name}`
                document.getElementById('buyer_product_base_price')   .innerText = parseFloat(data.base_price).toFixed(2)
                document.getElementById('buyer_product_logistic_cost_name').innerText = `Logistic cost to ${data.incoterm_name}`
                document.getElementById('buyer_product_logistic_cost').innerText = parseFloat(data.logistic_cost).toFixed(2)
                document.getElementById('buyer_price_markup_red')     .innerText = parseFloat(data.prices.red).toFixed(2)
                document.getElementById('buyer_price_markup_yellow')     .innerText = parseFloat(data.prices.yellow).toFixed(2)
                document.getElementById('buyer_price_markup_green')   .innerText = parseFloat(data.prices.green).toFixed(2)
                document.getElementById('buyer_price_markup_white')   .innerText = parseFloat(data.prices.white).toFixed(2)


                removeStylesFromInput()
                change_prices_values = data.prices
            })
    }
    function removeStylesFromInput(){
        price_changes_value.classList.remove('red')
        price_changes_value.classList.remove('yellow')
        price_changes_value.classList.remove('green')
        price_changes_value.classList.remove('white')
        price_changes_percent.classList.remove('red')
        price_changes_percent.classList.remove('yellow')
        price_changes_percent.classList.remove('green')
        price_changes_percent.classList.remove('white')

        btn_change_price.setAttribute("data-price-color", "")
    }

    Array.from(document.querySelectorAll(".buyer_markup.new_price")).forEach(function(element) {
        element.addEventListener('click', setMarkupPrice);
    });
    function setMarkupPrice(){
        const new_price = parseFloat(this.getElementsByClassName('product_new_cost')[0].innerText).toFixed(2)
        document.getElementById('price_changes_value').value = new_price
        document.getElementById('price_changes_value').dispatchEvent(new Event('input'));
        setMarkupValue()
    }
    function setMarkupValue(){
        let new_value = document.getElementById('price_changes_value').value
        let markup =  100 * (new_value - change_prices_values.logistic_cost) /  change_prices_values.base_price   - 100
        document.getElementById('price_changes_percent').value = parseInt(markup)
    }
    document.getElementById('price_changes_percent').addEventListener('input', function(){
        console.log("price_changes_value change")
        let new_value = 0

        new_value = (1 + this.value / 100) * change_prices_values.base_price + change_prices_values.logistic_cost
        new_value = new_value.toFixed(2)

        document.getElementById('price_changes_value').value = new_value
        setStylesToPrice(new_value)
    })
    document.getElementById('price_changes_value').addEventListener('input', function(){
        console.log("price_changes_value change")
        setStylesToPrice(parseFloat(document.getElementById('price_changes_value').value))
        setMarkupValue()
    })
    function setStylesToPrice(value){
        removeStylesFromInput()

        let style = ''
        if (value < change_prices_values.yellow) {
            style = 'red'
        } else if (value < change_prices_values.green) {
            style = 'yellow'
        } else if (value < change_prices_values.white) {
            style = 'green'
        } else {
            style = 'white'
        }

        price_changes_value.classList.add(style)
        price_changes_percent.classList.add(style)
        btn_change_price.setAttribute("data-price-color", style)
    }
    document.getElementById('btn_change_actual_price').addEventListener('click', function (evt) {
        document.getElementById('btn_change_actual_price').style.display = 'none'
        document.getElementById('div_change_price').style.display        = 'block'
    });
    document.getElementById('btn_change_price').addEventListener('click', function (evt) {

        const body = {
            product_id: this.getAttribute("data-product-id"),
            incoterm:   this.getAttribute("data-incoterm"),
            new_price:  document.getElementById('price_changes_value').value.replace(",", "."),
            new_color:  this.getAttribute("data-price-color"),
            comment:    document.getElementById('price_changes_comment').value,
        }

        if (body.new_price == '' || body.comment == '' ) {
            showAlert("Set new price and comment it")
            return
        }


        sendRequest("post", 'set_buyer_product_price', body)
            .then(data => {
                showNotify("Saved")
                change_buyer_price_input.innerHTML = parseFloat(body.new_price).toFixed(2)
                change_buyer_price_input.classList.remove('edit')
                change_buyer_price_input.classList.add('edited')
                change_buyer_price_parent.getElementsByClassName('price_history_show')[0].style.display = 'block'

                change_buyer_price_parent.classList.remove('red')
                change_buyer_price_parent.classList.remove('yellow')
                change_buyer_price_parent.classList.remove('green')
                change_buyer_price_parent.classList.remove('white')
                change_buyer_price_parent.classList.add(body.new_color)

                let btn_add = change_buyer_price_parent.getElementsByClassName('btn_add_buyer_price')[0]
                if (typeof btn_add != 'undefined') {btn_add.style.display = 'none'}


                let alert = change_buyer_price_parent.getElementsByClassName('price_alert')[0]
                if (typeof  alert != 'undefined' && alert != 'undefined') {
                    alert.style.display = 'none'
                }

                closePopup()
                updateOrdersSupplies()
            })
    })

    function updateOrdersSupplies(){
        sendRequest("post", 'get_orders_supplies', {})
            .then(data => {
                main_data.ordered_products = data.ordered_products
                main_data.supplies = data.supplies


                setOrderedProducts(main_data.ordered_products, user_status)
                setSupplies(main_data.supplies, user_status)
                updateNewMessages()
                checkPriceRequests()
            })
    }


    Array.from(document.querySelectorAll(".buyer_markup input")).forEach(function(element) {
        element.addEventListener('change', changeBuyerMarkup );
    });
    function changeBuyerMarkup(){
        document.getElementById('btn_save_markup').parentElement.style.display = 'flex'
    }
    document.getElementById('btn_save_markup').addEventListener('click', function (evt) {
        let btn_div = this.parentElement
        let buyer_id = this.getAttribute("data-buyer-id")
        const red    = parseFloat(document.getElementById('buyer_markup_red').value)
        const yellow  = parseFloat(document.getElementById('buyer_markup_yellow').value)
        const green  = parseFloat(document.getElementById('buyer_markup_green').value)
        const white  = parseFloat(document.getElementById('buyer_markup_white').value)
        if (yellow < red) {
            showAlert("Yellow line must be higher than red")
            return
        }
        if (green < yellow || green < red ) {
            showAlert("Green line must be higher than yellow and red")
            return
        }
        if (white < yellow || white < red  || white < green ) {
            showAlert("White line must be higher than yellow, red and green")
            return
        }

        sendRequest('post', 'update_buyer_markups', {
            buyer_id: buyer_id,

            red:   red,
            yellow: yellow,
            green: green,
            white: white})
            .then(data => {
                showCustomerInfo(buyer_id)
                showNotify('Changes saved')
                btn_div.style.display = 'none'
            })
            .catch(err => console.log(err))
    });

    Array.from(document.querySelectorAll(".manufacturer_buyer_info_filters")).forEach(function(element) {
        element.addEventListener('click', filterManufacturerBuyerInfo );
    });
    function filterManufacturerBuyerInfo(){
        Array.from(document.querySelectorAll(".manufacturer_buyer_info_filters")).forEach(function(element) {
            element.classList.remove('active')
        });
        this.classList.add("active")

        Array.from(document.querySelectorAll(".div_manufacturer_buyers_info")).forEach(function(element) {
            element.style.display = 'none'
        });
        document.getElementById(`div_manufacturer_buyers_${this.getAttribute("data-key")}`).style.display = 'flex'
    }


    let    element_clients_langs = null
    let set_clients_langs_tags = null
    function setLangs(for_whom, parent_page, cabinet_info){
        let request_name = ""
        if (for_whom == "manufacturer_buyer") {
            element_clients_langs = document.getElementById('set_clients_langs')
            request_name = 'update_client_langs'
        } else if (for_whom == "buyer") {
            element_clients_langs = document.getElementById('set_buyer_langs')
            request_name = 'update_client_langs'
        } else if (for_whom == "manufacturer") {
            element_clients_langs = document.getElementById('set_manufacturer_langs')
            request_name = 'update_manufacturer_langs'
        }

        tag_listener = false
        if (set_clients_langs_tags != null) {
            set_clients_langs_tags.removeAllTags()
            set_clients_langs_tags.destroy()
        }

        set_clients_langs_tags = new Tagify(element_clients_langs, {
            transformTag        : transformTag,
            callbacks        : {
                add    : updateClientLangs,  // callback when adding a tag
                remove : updateClientLangs   // callback when removing a tag
            },
            whitelist: main_data.lists_data.langs,
            enforceWhitelist: true,
            dropdown: {
                classname: "tags-look", // <- custom classname for this dropdown, so it could be targeted
                enabled: 0,             // <- show suggestions on focus
                closeOnSelect: false    // <- do not hide the suggestions dropdown once an item has been selected
            }
        })

        set_clients_langs_tags.addTags(cabinet_info.organization_langs.map(l => l.lang_name))

        tag_listener = true

        function updateClientLangs(){
            if (tag_listener == false){ return }


            let langs = []

            let langs_value = element_clients_langs.value
            console.log("langs_value ", langs_value)
            if (langs_value != ""){
                JSON.parse(langs_value).forEach(function(item, i, arr) {
                    langs.push(item.value)
                })
            }



            if (!langs.includes('English')) {
                showNotify("English is required")
                set_clients_langs_tags.addTags("English")
                return
            }

            sendRequest('post', request_name, {langs: langs, buyer_id: current_buyer.buyer_info.id} )
                .then(data => {
                    showNotify("Saved")
                    if (user_status == 'buyer') {
                        autocomplete(document.getElementById("ticket_lang_buyer"), data.langs.map((l) => l.lang_name), true, 'English');

                    }

                })
                .catch(err => console.log(err))
        }
    }
    function setCurrencies(for_whom, parent_page, currencies){
        let cb_usd = parent_page.getElementsByClassName("settings_currency_usd")[0]
        let cb_eur = parent_page.getElementsByClassName("settings_currency_eur")[0]
        let cb_rmb = parent_page.getElementsByClassName("settings_currency_rmb")[0]

        cb_usd.checked = currencies.includes("USD")
        cb_eur.checked = currencies.includes("EUR")
        cb_rmb.checked = currencies.includes("RMB")

        Array.from(parent_page.querySelectorAll(".settings_currency_usd, .settings_currency_eur, .settings_currency_rmb")).forEach(function(element) {
            element.addEventListener('click', saveNewCurrencies);
        });

        function saveNewCurrencies(){
            sendRequest('post', 'save_currencies', {
                buyer_id: current_buyer.buyer_info.id,
                usd: cb_usd.checked, eur: cb_eur.checked, rmb: cb_rmb.checked})
                .then(data => {
                    showNotify("Saved")
                })
                .catch(err => console.log(err))
        }
    }

    let set_clients_countries_tags = null
    let set_clients_incoterms_tags = null
    function setGeo(for_whom, parent_page, cabinet_info){


        console.log("setGeo ", cabinet_info)

        tag_listener = false
        let set_clients_countries = document.getElementById('set_clients_countries')
        if (set_clients_countries_tags != null) {
            set_clients_countries_tags.removeAllTags()
            set_clients_countries_tags.destroy()
        }
        set_clients_countries_tags = new Tagify(set_clients_countries, {
            transformTag        : transformTag,
            callbacks        : {
                add    : updateClientCountries,  // callback when adding a tag
                remove : updateClientCountries   // callback when removing a tag
            },
            whitelist: main_data.lists_data.countries,
            enforceWhitelist: true,
            dropdown: {
                classname: "tags-look", // <- custom classname for this dropdown, so it could be targeted
                enabled: 0,             // <- show suggestions on focus
                closeOnSelect: false    // <- do not hide the suggestions dropdown once an item has been selected
            }
        })

        console.log("main_data.lists_data.countries ", main_data.lists_data.countries)
        console.log("setGeo countries ", cabinet_info.countries.map(c => c.country_name))
        set_clients_countries_tags.addTags(cabinet_info.countries.map(c => c.country_name))



        let set_clients_incoterms = document.getElementById('set_clients_incoterms')
        if (set_clients_incoterms_tags != null) {
            set_clients_incoterms_tags.removeAllTags()
            set_clients_incoterms_tags.destroy()
        }
        set_clients_incoterms_tags = new Tagify(set_clients_incoterms, {
            transformTag        : transformTag,
            callbacks        : {
                add    : updateClientIncoterms,  // callback when adding a tag
                remove : updateClientIncoterms   // callback when removing a tag
            },
            whitelist: main_data.lists_data.incoterms,
            enforceWhitelist: true,
            dropdown: {
                classname: "tags-look", // <- custom classname for this dropdown, so it could be targeted
                enabled: 0,             // <- show suggestions on focus
                closeOnSelect: false    // <- do not hide the suggestions dropdown once an item has been selected
            }
        })
        console.log("main_data.lists_data.incoterms ", main_data.lists_data.incoterms)
        console.log("cabinet_info.incoterms ", cabinet_info.incoterms)
        set_clients_incoterms_tags.addTags(cabinet_info.incoterms)

        tag_listener = true

    }
    function updateClientIncoterms(){
        if (tag_listener == false){ return }

        let incoterms_dom = document.getElementById(`set_clients_incoterms`)

        let incoterms = []
        JSON.parse(incoterms_dom.value).forEach(function(item, i, arr) {
            incoterms.push(item.value)
        })


        sendRequest('post', 'update_client_incoterms', {incoterms: incoterms, buyer_id: current_buyer.buyer_info.id} )
            .then(data => {
                setCustomerProducts(data.incoterms, data.products)

                showNotify("Saved")
            })
            .catch(err => console.log(err))
    }
    function updateClientCountries(){
        if (tag_listener == false){ return }

        let countries_dom = document.getElementById(`set_clients_countries`)

        let countries = []
        JSON.parse(countries_dom.value).forEach(function(item, i, arr) {
            countries.push(item.value)
        })


        sendRequest('post', 'update_client_countries', {countries: countries, buyer_id: current_buyer.buyer_info.id} )
            .then(data => {
                showNotify("Saved")
            })
            .catch(err => console.log(err))
    }

    let element_clients_industries = null
    let set_clients_industries_tags = null
    let div_client_industry_2 = null
    let div_client_industry_3 = null
    let btn_add_industry = null
    let client_industries = []

    function setIndustries(for_whom, parent_page, industries) {
        let request_name = ""

        if (for_whom == "manufacturer_buyer") {
            request_name = "update_client_industries"
            element_clients_industries = document.getElementById('set_client_industries')
        } else if (for_whom == "buyer") {
            request_name = "update_client_industries"
            element_clients_industries = document.getElementById('set_buyer_industries')
        }


        tag_listener = false
        if (set_clients_industries_tags != null) {
            set_clients_industries_tags.removeAllTags()
            set_clients_industries_tags.destroy()
        }
        set_clients_industries_tags = new Tagify(element_clients_industries, {
            transformTag        : transformTag,
            callbacks        : {
                add    : updateClientIndustries,  // callback when adding a tag
                remove : updateClientIndustries   // callback when removing a tag
            },
            whitelist: main_data.lists_data.industries,
            enforceWhitelist: true,
            dropdown: {
                classname: "tags-look", // <- custom classname for this dropdown, so it could be targeted
                enabled: 0,             // <- show suggestions on focus
                closeOnSelect: false    // <- do not hide the suggestions dropdown once an item has been selected
            }
        })

        set_clients_industries_tags.addTags(current_buyer.cabinet_info.industries)

        tag_listener = true

        function updateClientIndustries(){
            if (tag_listener == false){ return }

            let industries = []
            let industries_value = element_clients_industries.value
            console.log("industries_value ", industries_value)
            if (industries_value != ""){
                JSON.parse(industries_value).forEach(function(item, i, arr) {
                    industries.push(item.value)
                })
            }

            sendRequest('post', request_name, {industries: industries, buyer_id: current_buyer.buyer_info.id} )
                .then(data => {
                    showNotify("Saved")
                })
                .catch(err => console.log(err))
        }
    }
    Array.from(document.querySelectorAll(".btn_add_industry")).forEach(function(element) {
        element.addEventListener('click', btnAddIndustry );
    })
    function btnAddIndustry(){
        let div = this.parentElement.parentElement

        if (client_industries.length === 1) {
            div_client_industry_2.style.display = 'flex'
        }
        if (client_industries.length === 2) {
            div_client_industry_3.style.display = 'flex'
            btn_add_industry.style.display = 'none'
        }
    }

    Array.from(document.querySelectorAll(".btns-induestries-selector")).forEach(function(element) {
        element.addEventListener('click', industriesSelector );
    });
    let dd_select_industries_1 = null
    let dd_select_industries_2 = null
    let dd_select_industries_3 = null
    function industriesSelector(){
        dd_select_industries_1.close()
        dd_select_industries_2.close()
        dd_select_industries_3.close()
        let btn = this.parentElement.parentElement.getElementsByClassName('btn')[0]
        btn.innerText = this.getAttribute("data-value")
    }

    document.getElementById('buyer_show_projects').addEventListener('change', function (evt) {

        console.log("buyer_show_projects ", this.checked)
        sendRequest('post', 'update_buyer_show_projects', {
            buyer_id:      current_buyer.buyer_info.id,
            show_projects: this.checked
        })
            .then(data => {
                current_buyer = data
                showNotify("Saved")
            })
            .catch(err => console.log(err))
    })
    document.getElementById('btn_buyer_save_changes').addEventListener('click', function (evt) {

        const body = {
            buyer_id:      this.getAttribute("data-buyer-id"),

            customer_name:  document.getElementById('buyer_name').value,
            customer_type:  document.getElementById('buyer_type').value,

            customer_country:  document.getElementById('customer_country').value,
            contact_name:      document.getElementById('buyer_contact_name').value,
            contact_email:     document.getElementById('buyer_contact_email').value,
            website:           document.getElementById('buyer_website').value,
            email:             document.getElementById('buyer_email').value,
            credit_limit:      document.getElementById('buyer_credit_limit').value,
            // credit_percent: document.getElementById('buyer_credit_percent').value,

            show_projects:        document.getElementById('buyer_show_projects').checked,
            show_planning_graphs: document.getElementById('buyer_show_planning_graphs').checked,
        }

        if (body.customer_name == '' || body.customer_type == '' || body.customer_country == '' || body.contact_name == '' ||
            body.contact_email == '' || body.website == '' || body.email == '' || body.credit_limit == '' ) {
            showAlert("Please fill all fields")
            return
        }

        sendRequest("post", 'update_manufacturer_buyer_info', body)
            .then(data => {
                showNotify("Saved")
            })
    });

    ///// - MANAGE CUSTOMERS ////






    ///// + MANAGE MARKET ////
    Array.from(document.querySelectorAll(".buyer_market_filters")).forEach(function(element) {
        element.addEventListener('click', filterBuyerMarket );
    });
    function filterBuyerMarket(){
        const div_market_digest = document.getElementById('div_market_digest')
        const div_market_news   = document.getElementById('div_market_news')

        div_market_digest.style.display = 'none'
        div_market_news.style.display = 'none'


        Array.from(document.querySelectorAll(".buyer_market_filters")).forEach(function(element) {
            element.classList.remove('active')
        });
        this.classList.add("active")

        if (this.getAttribute("data-key") == "digest") {
            document.getElementById(`div_market_${this.getAttribute("data-key")}`).style.display = 'flex'
        } else {
            document.getElementById(`div_market_${this.getAttribute("data-key")}`).style.display = 'block'
        }


    }

    let filter_dd_marketing_reports  = null
    Array.from(document.querySelectorAll(".btns-marketing-report")).forEach(function(element) {
        element.addEventListener('click', changeMarketReport );
    });
    function changeMarketReport(){
        filter_dd_marketing_reports.close()
        document.getElementById('marketing_filter_reports') .innerText = "Market report: " + this.innerText
    }


    Array.from(document.getElementsByClassName("list-buyer-market")).forEach(function(element) {
        element.addEventListener('click', showMarketMoreInfo );
    })
    function showMarketMoreInfo(){
        let full_info_element = this.getElementsByClassName('buyer_market_content')[0]
        console.log("full_info_element.style.display ", full_info_element.style.display)
        if (full_info_element.style.display != 'block') {
            // this.innerHTML = 'HIDE'
            full_info_element.style.display = 'block'
        } else {
            // this.innerHTML = 'OPEN'
            full_info_element.style.display = 'none'
        }
    }



    Array.from(document.querySelectorAll(".marketing_filters")).forEach(function(element) {
        element.addEventListener('click', filterMarketing );
    });
    function filterMarketing(){
        const div_marketing_digest = document.getElementById('div_marketing_digest')
        const div_marketing_analog = document.getElementById('div_marketing_analog')
        //const div_marketing_quarter = document.getElementById('div_marketing_quarter')
        const div_marketing_customers = document.getElementById('div_marketing_customers')

        div_marketing_digest.style.display = 'none'
        div_marketing_analog.style.display = 'none'
        //div_marketing_quarter.style.display = 'none'
        div_marketing_customers.style.display = 'none'

        Array.from(document.querySelectorAll(".marketing_filters")).forEach(function(element) {
            element.classList.remove('active')
        });
        this.classList.add("active")

        document.getElementById(`div_marketing_${this.getAttribute("data-key")}`).style.display = 'flex'
    }


    document.getElementById('input_filter_ingredients').addEventListener('input', function(){
        const search_value = this.value.toLowerCase()

        let product_list = main_data.product_analog.filter(function(item) {
            const manufacturer_product = item.manufacturer_product_name.toLowerCase().includes(search_value)
            const analog_product       = item.analog_product_name.toLowerCase().includes(search_value)
            const analog_manufacturer  = item.analog_manufacturer.toLowerCase().includes(search_value)
            return manufacturer_product || analog_product || analog_manufacturer
        });

        setMarketingAnalog(product_list)
    })
    function setMarketingAnalog(data){
        let result = ''

        data.forEach(function(product_analog, i) {

            let comment = product_analog.comment
            if (comment.length > 30) {comment = comment.substring(0,28) + "..."}
            let row = `<tr class="spg_table_row" data-analog-id="${product_analog.id}">
                           <td>${product_analog.manufacturer_product_name}</td>
                           <td>${product_analog.analog_product_name}</td>
                           <td>${product_analog.analog_manufacturer}</td>
                           <td class="analog_comment" data-tippy-content="${product_analog.comment}">${comment}</td>
                       </tr>`
            result += row
        });

        const table = document.getElementById('table_marketing_analog')
        table.innerHTML = result

        tippy('.analog_comment', {
            followCursor: 'horizontal',
            animation: 'fade',
        });

    }

    ///// - MANAGE MARKET ////







    ///// + MANAGE MANUFACTURERS ////
    function setManufacturers(manufacturers){
        const page = document.getElementById('page_manufacturers')

        Array.from(page.getElementsByClassName('list-manufacturer-user')).forEach((item) => {
            let display = 'none'
            if (main_data.cabinet_info.name == "Optima Union") {
                if (["DSM", "DSM Zhongken", "Andre Pectin", "DSM Rainbow"].includes(item.getAttribute("data-name"))) {
                    display = 'flex'
                }
            } else {
                if (["DSM", "Andre Pectin"].includes(item.getAttribute("data-name"))) {
                    display = 'flex'
                }
            }
            item.style.display = display

        })
    }

    Array.from(document.getElementsByClassName("list-manufacturer-user")).forEach(function(element) {
        element.addEventListener('click', showManufacturerMoreInfo );
    })
    function showManufacturerMoreInfo(){
        let full_info_element = this.getElementsByClassName('manufacturer_description')[0]
        if (full_info_element.style.display != 'block') {
            // this.innerHTML = 'HIDE'
            full_info_element.style.display = 'block'
        } else {
            // this.innerHTML = 'OPEN'
            full_info_element.style.display = 'none'
        }

    }

    ///// - MANAGE MANUFACTURERS ////






































    // Admin functions
    let user_for_admin = []
    //let user_products = []
    let admin_action_with_user
    let admin_action_with_product
    let admin_action_with_manufacturer
    let edit_user_id
    let edit_product_id
    let edit_manufacturer_id
    let user_addresses = []
    let product_links = []
    let manufacturer_links = []

    function startAdmin(){
        fetch(
            `${api_url}get_admin_info`,
            { method: 'GET',
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }})
            .then( response => response.json() )
            .then( json => {
                main_data = json
                console.log("data ", json);
                document.getElementsByClassName("load_container")[0].style.display = 'none'
                document.querySelectorAll(".containers").forEach(obj=>obj.classList.remove("visible"));
                document.getElementsByClassName("admin_container")[0].classList.add("visible");

                //document.getElementById("page_admin_orders").style.display = 'flex'
                document.getElementById("page_admin_users").style.display = 'flex'

                setAdminUsers(json.users)
                setAdminProducts(json.products)
                //setAdminOrders(json.orders)
                setAdminManufacturers(json.manufacturers)
                //document.getElementById('test_open').click()
            })
            .catch( error => console.error('error:', error) );

    }

    function setAdminUsers(users){
        console.log("setAdminUsers ", users)
        let users_list = document.getElementById("table_admin_users")
        users_list.innerHTML = ''
        users.forEach(function(item, i, arr) {
            console.log("user ", item)

            let div_approve = ''
            if (!item.approved) {
                div_approve = `<td><div class="approve_user action-btn" data-user-id="${item.id}" >APPROVE</div></td>`
            }


            users_list.innerHTML += `
                    <tr class="spg_table_row"  data-user-id="${item.id}">
                        <td><img class="edit_user" data-user-id="${item.id}" data-action="edit" data-popup-name="admin_users"  src="img/edit.svg"/> </td>
                        <td>${item.organization}</td>
                        <td>${item.website}</td>
                        <td>${item.status}</td>
                        <td>${item.first_name} ${item.last_name}</td>
                        <td>${item.position}</td>
                        <td>${item.email}</td>
                        <td>${item.phone}</td>
                        ${div_approve}
                    </tr>`

        })

        Array.from(document.querySelectorAll(".edit_user")).forEach(function(element) {
            element.addEventListener('click', openPopup )
        });
        Array.from(document.querySelectorAll(".approve_user")).forEach(function(element) {


            element.addEventListener('click', (e) => {
                console.log("this ", e.srcElement)
                console.log("this ", e.srcElement.getAttribute('data-user-id'))

                sendRequest('post', 'approve_user', {user_id: e.srcElement.getAttribute('data-user-id')})
                    .then(data => {startAdmin()})
                    .catch(err => console.log(err))})
        });
    }


    let filter_orders = {product: '', company: ''}

    function filterOrders(){

    }






















































    function setAdminOrders(orders){
        let orders_list = document.getElementsByClassName('list-orders-admin')[0]
        let orders_manufacturer_list = document.getElementsByClassName('list-orders-admin')[0]

        orders_list.innerHTML = ""
        orders_manufacturer_list.innerHTML = ""
        orders.forEach(function(item, i, arr) {
            console.log(item )
            let val = `
                    <div class="list-order-admin">
                        <div class="order-admin-details text_info"  data-order-id="${item.order_id}" data-user-id="${item.user_id}">
                            <div class="name">${item.organization}. ${item.order_name}</div>
                        </div>

                        <div class="statuses"  data-order-id="${item.order_id}" >
                            <div class="order_cost">$ ${item.order_cost}</div>
                            <div class="status color-${item.status_id}">${item.status}</div>
                        </div>
                    </div>
            `
            orders_list.innerHTML += val
            orders_manufacturer_list.innerHTML += val

        });


        //Array.from(document.getElementsByClassName("order-admin-edit")).forEach(function(element) {
        //    element.addEventListener('click', showPopupEditOrder );
        //});
    }
    function setAdminProducts(products){
        console.log("setAdminProducts ", products)
        let products_list = document.getElementById("table_admin_products")
        products_list.innerHTML = ''
        products.forEach(function(item, i, arr) {
            console.log("product ", item)

            let approved_status_btns = ''
            if (item.approved_status === 'pending') {
                approved_status_btns = `
                                    <td><div class="action-btn admin_product_approve">Approve price</div></td>
                                    <td><div class="action-btn admin_product_decline">Decline product</div></td>`
            }

            products_list.innerHTML += `
                    <tr class="spg_table_row"  data-product-id="${item.id}">
                        <td><img class="edit_product" data-product-id="${item.id}" data-action="edit" data-popup-name="admin_products"  src="img/edit.svg"/> </td>
                        <td>${item.manufacturer_name}</td>
                        <td>${item.name}</td>
                        <td>${item.price_type}</td>
                        <td>${item.price_value}</td>
                        <td>${item.approved_status}</td>
                        ${approved_status_btns}
                    </tr>`
            //products_list.innerHTML += `
            //    <div>
            //        <img class="edit_product" data-product-id="${item.id}" data-action="edit" data-popup-name="admin_products"  src="img/edit.svg"/>
            //        ${item.manufacturer_name}
            //        ${item.name}
            //        ${approved_status}
            //    </div>`
        })


        Array.from(document.querySelectorAll(".edit_product")).forEach(function(element) {
            element.addEventListener('click', openPopup )
        });

        Array.from(document.getElementsByClassName("admin_product_decline")).forEach(function(element) {
            element.addEventListener('click', adminProductDecline)
        });

        Array.from(document.getElementsByClassName("admin_product_approve")).forEach(function(element) {
            element.addEventListener('click', adminProductApprove )
        });

    }
    function adminProductApprove(){
        const product_id = this.parentElement.parentElement.getAttribute('data-product-id')
        sendRequest('post', 'admin_product_approve', {product_id: product_id})
            .then(data => {
                showAlert("Продукт подтвержден")
                setAdminProducts(data.products)})
            .catch(err => console.log(err))
    }
    function adminProductDecline(){
        const product_id = this.parentElement.parentElement.getAttribute('data-product-id')
        sendRequest('post', 'admin_product_decline', {product_id: product_id})
            .then(data => {
                showAlert("Продукт отклонён")
                setAdminProducts(data.products)})
            .catch(err => console.log(err))
    }

    document.getElementById('btn_admin_user_main_info').onclick = function(){
        document.getElementById('btn_admin_user_main_info').style.display = 'none'
        document.getElementById('admin_user_main_info')    .style.display = 'block'
    }

    function setAdminManufacturers(manufacturers){
        console.log("setAdminManufacturers ", manufacturers)
        let manufacturers_list = document.getElementsByClassName("list-manufacturers-admin")[0]
        manufacturers_list.innerHTML = ''
        manufacturers.forEach(function(item, i, arr) {
            console.log("product ", item)
            manufacturers_list.innerHTML += `
                    <div class="list-manufacturer-admin">
                        <div class="text_info">
                            <div class="name">${item.name}</div>
                            <div class="description">${item.description.replace(/(?:\r\n|\r|\n)/g, '<br>')}</div>
                        </div>

                        <div class="statuses">
                            <img  class="edit_manufacturer" data-manufacturer-id="${item.id}" data-action="edit" data-popup-name="admin_manufacturers"  src="img/edit.svg" />
                        </div>
                    </div>`})

        Array.from(document.querySelectorAll(".edit_manufacturer")).forEach(function(element) {
            element.addEventListener('click', openPopup )
        });
    }

    function setManufacturerLinksList(manufacturer_links) {
        console.log('manufacturer_links ', manufacturer_links)
        let manufacturer_links_list = document.getElementById('manufacturer_links_list')
        manufacturer_links_list.innerHTML = ''
        manufacturer_links.forEach(function(item, i, arr) {
            manufacturer_links_list.innerHTML += ` <div><img class="manufacturer_delete_link" data-position="${i}" src='img/close.svg'> ${item.name}<br>${item.value}</div> `
        })

        Array.from(document.querySelectorAll(".manufacturer_delete_link")).forEach(function(element) {
            element.addEventListener('click', manufacturerDeleteLink )
        });

    }
    function manufacturerDeleteLink(){
        let position = this.getAttribute("data-position")
        manufacturer_links = manufacturer_links.filter(function(item, i) {
            return i !== parseInt(position);
        });
        setManufacturerLinksList(manufacturer_links)
    }

    document.getElementById('btn_add_product_link').onclick = function(){
        document.getElementById('div_add_product_link_real').style.display = 'flex'
        document.getElementById('product_link_name') .value = ''
        document.getElementById('product_link_value').value = ''
    };
    document.getElementById('btn_save_product_link').onclick = function(){
        document.getElementById('div_add_product_link_real').style.display = 'none'
        product_links[product_links.length] = {
            name:  document.getElementById('product_link_name') .value,
            value: document.getElementById('product_link_value').value
        }
        setProductLinksList(product_links)
    };
    function setProductLinksList(product_links) {
        console.log('user_addresses ', product_links)
        let product_links_list = document.getElementById('product_links_list')
        product_links_list.innerHTML = ''
        product_links.forEach(function(item, i, arr) {
            product_links_list.innerHTML += ` <div><img class="delete_link" data-position="${i}" src='img/close.svg'> ${item.name}<br>${item.value}</div> `
        })

        Array.from(document.querySelectorAll(".delete_link")).forEach(function(element) {
            element.addEventListener('click', deleteLink )
        });

    }
    function deleteLink(){
        let position = this.getAttribute("data-position")
        product_links = product_links.filter(function(item, i) {
            return i !== parseInt(position);
        });
        setProductLinksList(product_links)
    }

    document.getElementById('btn_product_save').onclick = function() {
        let name        = document.getElementById('name').value
        let description = document.getElementById('description').value
        let price_exw   = document.getElementById('price_exw').value
        let price_fca   = document.getElementById('price_fca').value
        let price_fob   = document.getElementById('price_fob').value
        let price_cif   = document.getElementById('price_cif').value
        let price_ddp   = document.getElementById('price_ddp').value
        let min_count   = document.getElementById('min_count').value

        let manufacturer_selector = document.getElementById('selector_manufacturer')
        let category_selector     = document.getElementById('selector_category')
        let type_selector     = document.getElementById('selector_type')

        if (name === '' || description === '' || price_exw === '' || price_fca === '' || price_fob === '' || price_cif === ''  || price_ddp === ''  || min_count === '' ) {
            showAlert("Fill in all fields")
            return;
        }

        console.log("")
        if (manufacturer_selector.selectedIndex === 0) {
            showAlert("Выберите производителя")
            return;
        }
        if (category_selector.selectedIndex === 0) {
            showAlert("Выберите категорию")
            return;
        }
        if (type_selector.selectedIndex === 0) {
            showAlert("Выберите тип")
            return;
        }

        let manufacturer_id =   manufacturer_selector.options[manufacturer_selector.selectedIndex].value
        let category_key    =   category_selector.options[category_selector.selectedIndex].value
        let product_type    =   type_selector.options[type_selector.selectedIndex].value

        fetch(
            `${api_url}${admin_action_with_product}_product`,
            { method: 'post',
                body: JSON.stringify({
                    product_id: edit_product_id,
                    name:         name       ,
                    product_type: product_type,
                    description:  description,
                    price_exw:    price_exw  ,
                    price_fca:    price_fca  ,
                    price_fob:    price_fob  ,
                    price_cif:    price_cif  ,
                    price_ddp:    price_ddp  ,
                    min_count:    min_count  ,

                    manufacturer_id: manufacturer_id,
                    category_key:     category_key,
                    links: product_links

                }),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                if (json.error === 0) {
                    document.getElementById(`popup_background`).style.display = 'none'

                    if (admin_action_with_product === "edit") {
                        showAlert("Данные успешно обновлены")
                    } else {
                        showAlert("Товар создан")
                    }
                    setAdminProducts(json.products)

                }
            })
            .catch( error => console.error('error:', error) );

    }


    function clearUserPopup(){
        document.getElementById('user_first_name').value   = ``
        document.getElementById('user_last_name').value    = ``
        document.getElementById('user_phone').value        = ``
        document.getElementById('user_email').value        = ``
        document.getElementById('user_password').value     = ``
        document.getElementById('user_organization').value = ``

        document.getElementById('user_status').selectedIndex = 0
        document.getElementById('user_status').disabled = false

        document.getElementById('user_markup_gellan') .value = ``
        document.getElementById('user_markup_pectin') .value = ``
        document.getElementById('user_credit_percent').value = ``

        document.getElementById('div_admin_user_products').innerText = ''
        document.getElementById('user_addresses_list').innerText = ''
        document.getElementById('div_add_address_real').style.display = 'none'

        user_for_admin  = {}
        //user_products  = []
        user_addresses = []
    }

    let user_supply = {
        distributor: false,
        direct:      false,
        partner:      false}
    let user_incoterms = {
        fca: false,
        fob: false,
        cif: false,
        cpt: false,
        ddu: false,
        ddp: false}

    function getUserInfoAdmin(user_id){
        fetch(
            `${api_url}get_admin_user_info`,
            { method: 'post',
                body: JSON.stringify({
                    user_id: user_id
                }),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                console.log("get_admin_user_info ", json)
                user_for_admin  = json.user
                user_incoterms = { fca: json.user.incoterms_fca,
                    fob: json.user.incoterms_fob,
                    cif: json.user.incoterms_cif,
                    cpt: json.user.incoterms_cpt,
                    ddu: json.user.incoterms_ddu,
                    ddp: json.user.incoterms_ddp}
                user_supply = {
                    distributor: json.user.supply_distributor,
                    direct:      json.user.supply_direct,
                    partner:      json.user.supply_partner}

                setUserProductsAdmin(json.products )
                setUserAddressesList(json.addresses)
                user_products  = json.products
                user_addresses = json.addresses

                document.getElementById('user_first_name').value   = json.user.first_name
                document.getElementById('user_last_name').value    = json.user.last_name
                document.getElementById('user_phone').value        = json.user.phone
                document.getElementById('user_email').value        = json.user.email
                document.getElementById('user_password').value     = json.user.password
                document.getElementById('user_organization').value = json.user.organization

                document.getElementById('user_markup_gellan').value  = json.user.markup_gellan
                document.getElementById('user_markup_pectin').value  = json.user.markup_pectin
                document.getElementById('user_credit_percent').value = json.user.credit_percent

                document.getElementById('user_status').value    = json.user.status
                document.getElementById('user_status').disabled = true


                Array.from(document.querySelectorAll(".btns-user-incoterms")).forEach(function(element) {
                    element.classList.remove("active")

                    switch(element.getAttribute("data-value")){
                        case "FCA":
                            if (user_incoterms.fca) {element.classList.add("active")}
                            break;
                        case "FOB":
                            if (user_incoterms.fob) {element.classList.add("active")}
                            break;
                        case "CIF":
                            if (user_incoterms.cif) {element.classList.add("active")}
                            break;
                        case "CPT":
                            if (user_incoterms.cpt) {element.classList.add("active")}
                            break;
                        case "DDU":
                            if (user_incoterms.ddu) {element.classList.add("active")}
                            break;
                        case "DDP":
                            if (user_incoterms.ddp) {element.classList.add("active")}
                            break;
                    }
                });

                Array.from(document.querySelectorAll(".btns-user-supply")).forEach(function(element) {
                    element.classList.remove("active")

                    switch(element.getAttribute("data-value")){
                        case "distributor":
                            if (user_supply.distributor) {element.classList.add("active")}
                            break;
                        case "direct":
                            if (user_supply.direct) {element.classList.add("active")}
                            break;
                        case "partner":
                            if (user_supply.partner) {element.classList.add("active")}
                            break;
                    }
                });




            })
            .catch( error => console.error('error:', error) );
    }
    Array.from(document.querySelectorAll(".btns-user-incoterms")).forEach(function(element) {
        element.addEventListener('click', changeUserIncoterms );
    });

    function changeUserIncoterms(){
        console.log("changeUserIncoterms")
        console.log("user_incoterms ", user_incoterms)

        if (this.classList.contains('active')) {
            this.classList.remove('active')
            user_incoterms[this.getAttribute("data-value").toLowerCase()] = false
            Array.from(document.querySelectorAll(`.change_user_product_price[data-tippy-content=${this.getAttribute("data-value")}]`)).forEach(function(element) {
                element.classList.remove('visible')
            })
        } else {
            this.classList.add('active')
            user_incoterms[this.getAttribute("data-value").toLowerCase()] = true
            Array.from(document.querySelectorAll(`.change_user_product_price[data-tippy-content=${this.getAttribute("data-value")}]`)).forEach(function(element) {
                element.classList.add('visible')
                if (parseInt(element.value) === 0 || element.value === ''){
                    element.style.backgroundColor = 'rgba(255, 53, 74, 0.7)'
                }
            })
        }
        console.log("user_incoterms ", user_incoterms)
    }

    Array.from(document.querySelectorAll(".btns-user-supply")).forEach(function(element) {
        element.addEventListener('click', changeUserSupply );
    });
    function changeUserSupply(){

        if (this.classList.contains('active')) {
            this.classList.remove('active')
            user_supply[this.getAttribute("data-value")] = false
        } else {
            this.classList.add('active')
            user_supply[this.getAttribute("data-value")] = true
        }
    }

    /*
    document.getElementById('user_markup_gellan').oninput = function (){
        let new_markup = this.value
        user_products.forEach(function(element) {
            if (element.product_type === 'gellan') {element["markup"] = new_markup}
        })
        setUserProductsAdmin(user_products)
    }
    document.getElementById('user_markup_pectin').oninput = function (){
        let new_markup = this.value
        user_products.forEach(function(element) {
            if (element.product_type === 'pectin') {element["markup"] = new_markup}
        })
        setUserProductsAdmin(user_products)
    }

*/

    function setUserProductsAdmin(products){
        let products_list = document.getElementById('div_admin_user_products')
        products_list.innerHTML = 'Продукты<br><br>'
        console.log("products_list ", products)
        console.log("user_incoterms ", user_incoterms)

        products.forEach(function(item, i, arr) {


            let prices_visible = ""
            let icon_name = "close"
            if (item.selected) {
                prices_visible = "visible"
                icon_name = "check"
                console.log("item.selected ", item.selected)
            }

            products_list.innerHTML += `
                    <div data-position="${i}">
                        <input type="number" class="change_user_product_markup ${prices_visible ? 'visible' : ''}"  value="${item.markup}"  data-tippy-content="Наценка SPG" />
                        <img class="add_product_to_user" data-selected="${item.selected}"  data-position="${i}" src='img/${icon_name}.svg'/>
                        ${item.name}<br>
                        <div class="div_user_product_prices ${prices_visible}">
                            <input type="number" class="change_user_product_price ${user_incoterms.fca ? 'visible' : ''}" data-position="${i}"  value="${item.price_fca}"  data-tippy-content="FCA" />
                            <input type="number" class="change_user_product_price ${user_incoterms.fob ? 'visible' : ''}" data-position="${i}"  value="${item.price_fob}"  data-tippy-content="FOB" />
                            <input type="number" class="change_user_product_price ${user_incoterms.cif ? 'visible' : ''}" data-position="${i}"  value="${item.price_cif}"  data-tippy-content="CIF" />
                            <input type="number" class="change_user_product_price ${user_incoterms.cpt ? 'visible' : ''}" data-position="${i}"  value="${item.price_cpt}"  data-tippy-content="CPT" />
                            <input type="number" class="change_user_product_price ${user_incoterms.ddu ? 'visible' : ''}" data-position="${i}"  value="${item.price_ddu}"  data-tippy-content="DDU" />
                            <input type="number" class="change_user_product_price ${user_incoterms.ddp ? 'visible' : ''}" data-position="${i}"  value="${item.price_ddp}"  data-tippy-content="DDP" />
                        </div>
                    </div>`
        })


        Array.from(document.querySelectorAll(".change_user_product_markup")).forEach(function(element) {
            element.addEventListener('input', changeUserProductMarkup )
        });
        Array.from(document.querySelectorAll(".change_user_product_price")).forEach(function(element) {
            element.addEventListener('input', changeUserProductsPrice )
        });

        Array.from(document.querySelectorAll(".add_product_to_user")).forEach(function(element) {
            element.addEventListener('click', addProductToUser )
        });

        tippy('.change_user_product_price, .change_user_product_markup', {
            followCursor: 'horizontal',
            animation: 'fade',
        });
    }

    /*
    function changeUserProductMarkup(){
        let position = this.getAttribute("data-position")
        if (parseInt(this.value) <= 0) {
            this.value = 0
        }
        user_products[position].markup = this.value

    }

    function changeUserProductsPrice(){
        let position  = this.getAttribute("data-position")
        let incoterm  = this.getAttribute("data-tippy-content").toLowerCase()

        if (this.value >= 0) {
            user_products[position][`price_${incoterm}`] = this.value
        }

        if (parseInt(this.value) === 0 || this.value === ''){
            this.style.backgroundColor = 'rgba(255, 53, 74, 0.7)'
        } else {
            this.style.backgroundColor = 'white'
        }
        //setUserProductsAdmin(user_products)
    }

    function addProductToUser(){
        let position = this.getAttribute("data-position")
        let selected = this.getAttribute("data-selected")
        let input_div = this.parentElement.getElementsByClassName('div_user_product_prices')[0]

        user_products[position].selected = selected === "true" ? false : true

        if (user_products[position].selected) {
            input_div.classList.add('visible')
        } else {
            input_div.classList.remove('visible')
        }

        setUserProductsAdmin(user_products)
    }
    */

    document.getElementById('btn_add_address').onclick = function(){
        document.getElementById('div_add_address_real').style.display = 'flex'
        document.getElementById('user_new_address').value = ''
    };
    document.getElementById('btn_user_save_address').onclick = function(){
        document.getElementById('div_add_address_real').style.display = 'none'
        user_addresses[user_addresses.length] = document.getElementById('user_new_address').value
        setUserAddressesList(user_addresses)
    };
    function setUserAddressesList(user_addresses) {
        console.log('user_addresses ', user_addresses)
        const addresses_list = document.getElementById('user_addresses_list')
        addresses_list.innerHTML = ''
        user_addresses.forEach(function(item, i, arr) {
            addresses_list.innerHTML += ` <div><img class="delete_address" data-position="${i}" src='img/close.svg'> ${item}</div> `
        })

        Array.from(document.querySelectorAll(".delete_address")).forEach(function(element) {
            element.addEventListener('click', deleteAddress )
        });

    }
    function deleteAddress(){
        let position = this.getAttribute("data-position")

        user_addresses = user_addresses.filter(function(item, i) {
            return i !== parseInt(position);
        });
        setUserAddressesList(user_addresses)
    }

    document.getElementById('btn_user_save').onclick = function() {
        let status_selector = document.getElementById('user_status')
        let first_name      = document.getElementById('user_first_name').value
        let last_name       = document.getElementById('user_last_name').value
        let phone           = document.getElementById('user_phone').value
        let email           = document.getElementById('user_email').value
        let password        = document.getElementById('user_password').value
        let organization    = document.getElementById('user_organization').value
        let markup_gellan   = document.getElementById('user_markup_gellan').value
        let markup_pectin   = document.getElementById('user_markup_pectin').value
        let credit_percent  = document.getElementById('user_credit_percent').value

        if (status_selector.selectedIndex === 0) {
            showAlert("Выберите статус создаваемого пользователя")
            return;
        }


        if (first_name === '' || last_name === '' || phone === '' || email === '' || password === '' ||
            organization === ''  || markup_gellan === ''  || markup_pectin === ''  || credit_percent === '') {
            showAlert("Fill in all fields")
            return;
        }

        if (user_addresses.length === 0) {
            showAlert("Напишите хотя бы 1 адрес")
            return;
        }

        let user_products_selected = user_products
        user_products_selected = user_products_selected.filter(function(item, i) {return item.selected });
        if (user_products_selected.length === 0) {
            showAlert("Выберите хотя бы 1 продукт")
            return;
        }


        fetch(
            `${api_url}${admin_action_with_user}_user`,
            { method: 'post',
                body: JSON.stringify({
                    base_info: {
                        status:       status_selector.options[status_selector.selectedIndex].value,
                        user_id:      edit_user_id,
                        first_name:   first_name,
                        last_name:    last_name,
                        phone:        phone,
                        email:        email,
                        password:     password,
                        organization: organization,
                        markup_gellan:  markup_gellan,
                        markup_pectin:  markup_pectin,
                        credit_percent: credit_percent,
                    },
                    addresses: user_addresses,
                    products:  user_products,
                    incoterms: user_incoterms,
                    supply: user_supply,
                }),
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/json'
                }})
            .then( response => response.json() )
            .then( json => {
                if (json.error === 0) {
                    document.getElementById(`popup_background`).style.display = 'none'

                    if (admin_action_with_user === "edit") {
                        showAlert("Данные успешно обновлены")
                    } else {
                        showAlert("Пользователь создан")
                    }
                    setAdminUsers(json.users)


                } else {
                    showAlert("Пользователь с такой почтой уже существует")
                }
            })
            .catch( error => console.error('error:', error) );

    }

























    function copyToClipboard(text) {
        showNotify("Copied to buffer")

        if (window.clipboardData && window.clipboardData.setData) {
            // IE specific code path to prevent textarea being shown while dialog is visible.
            return clipboardData.setData("Text", text);

        } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
            var textarea = document.createElement("textarea");
            textarea.textContent = text;
            textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
            document.body.appendChild(textarea);
            textarea.select();
            try {
                return document.execCommand("copy");  // Security exception may be thrown by some browsers.
            } catch (ex) {
                console.warn("Copy to clipboard failed.", ex);
                return false;
            } finally {
                document.body.removeChild(textarea);
            }
        }


    }
    function copyInnerText(){
        copyToClipboard(this.innerText)

    }



    function getMarkupColor(markup){
        let color = ''
        if        (markup < parseFloat(main_data.cabinet_info.markups.yellow)) {
            color = 'red'
        } else if (markup < parseFloat(main_data.cabinet_info.markups.green)) {
            color = 'yellow'
        } else if (markup < parseFloat(main_data.cabinet_info.markups.white)) {
            color = 'green'
        } else {
            color = 'white'
        }

        return color
    }


    function getDiff(current, prev){

        const l_current = parseInt(current.toString().replace(/ /g,''))
        let l_prev = parseInt(prev.toString().replace(/ /g,''))

        if (isNaN(l_prev)) {
            return ''
        } else {
            if (l_prev == 0) {
                return ''
            } else {
                return (100 * l_current / l_prev - 100).toFixed(0) + '%'
            }
        }

    }

    function getQuarter(month){
        let quarter = 10
        switch (parseInt(month)){
            case 1:
            case 2:
            case 3:
                quarter = 1
                break
            case 4:
            case 5:
            case 6:
                quarter = 2
                break
            case 7:
            case 8:
            case 9:
                quarter = 3
                break
            case 10:
            case 11:
            case 12:
                quarter = 4
                break
        }

        return quarter
    }


    function initSteppedProgress() {
        var DIV = "div";
        var BUTTON = "button";
        var SPAN = "span";
        var P = "p";
        var A = "a";

        [].forEach.call(
            document.querySelectorAll("[data-stepped-bar]"),
            function (steppedProgress, index) {
                if (steppedProgress) {
                    var valueTotal = 0;
                    var data;

                    if (steppedProgress.getAttribute("data-stepped-bar")) {
                        data = JSON.parse(steppedProgress.getAttribute("data-stepped-bar"));
                    } else {
                        data = defaults;
                    }

                    //#region: Markup



                    var step = createElementWithClass(DIV, "syncro-progress-stepped");

                    var row = createElementWithClass(DIV, "syncro-row");

                    data.categories.forEach(function (catagory, i) {
                        valueTotal += catagory.value;
                    });

                    data.categories.forEach(function (catagory, i) {
                        var stepItem = createElementWithClass(
                            DIV,
                            "syncro-progress-stepped-item"
                        );
                        stepItem.setAttribute(
                            "data-id",
                            "progress-stepped-item-" + index + "-" + i
                        );
                        stepItem.textContent = formatNum(catagory.value);
                        stepItem.style.width = (catagory.value / valueTotal) * 100 + "%";
                        stepItem.style.background = catagory.color;
                        stepItem.setAttribute("data-tippy-content", catagory.name)

                        step.appendChild(stepItem);

                        if (data.show_legend == "true"){

                            var dot = createElementWithClass(SPAN, "syncro-dot");
                            dot.style.background = catagory.color;

                            var category = createElementWithClass(SPAN, "syncro-category-name");
                            category.textContent = catagory.name;

                            var btn = createElementWithClass(BUTTON, "syncro-btn");
                            btn.setAttribute(
                                "data-target",
                                "progress-stepped-item-" + index + "-" + i
                            );
                            btn.appendChild(dot);
                            btn.appendChild(category);

                            var col = createElementWithClass(DIV, "syncro-col-auto");
                            col.appendChild(btn);

                            row.appendChild(col);
                        }


                    });

                    var cardBody = createElementWithClass(DIV, "syncro-card-body");
                    cardBody.appendChild(step);

                    cardBody.appendChild(row);

                    var card = createElementWithClass(DIV, "syncro-card");
                    card.appendChild(cardBody);

                    var markup = createElementWithClass(DIV);
                    markup.appendChild(card);




                    steppedProgress.innerHTML = markup.innerHTML;

                    tippy(`.syncro-progress-stepped-item`, {
                        followCursor: 'horizontal',
                        animation: 'fade',
                    });

                    //#endregion: Markup

                    //#region:
                    //[].forEach.call(
                    //    steppedProgress.querySelectorAll(".syncro-progress-stepped-item"),
                    //    function (el) {
                    //        el.addEventListener("mouseenter", (e) => {
                    //            toggleActive(e, el);
                    //        });
                    //        el.addEventListener("mouseleave", (e) => {
                    //            toggleActive(e, el);
                    //        });
                    //    }
                    //);
                    //[].forEach.call(
                    //    steppedProgress.querySelectorAll(".syncro-btn"),
                    //    function (el) {
                    //        el.addEventListener("click", function () {
                    //            const dataID = el.getAttribute("data-target");
                    //            var targetElm = document.querySelector(
                    //                '[data-id="' + dataID + '"]'
                    //            );
//
                    //            if (targetElm.classList.contains("active")) {
                    //                targetElm.classList.remove("active");
                    //            } else {
                    //                [].forEach.call(
                    //                    steppedProgress.querySelectorAll(
                    //                        ".syncro-progress-stepped-item"
                    //                    ),
                    //                    function (el) {
                    //                        el.classList.remove("active");
                    //                    }
                    //                );
                    //                targetElm.classList.add("active");
                    //            }
                    //        });
                    //    }
                    //);
                    //#endregion
                }
            }
        );
    }
    function toggleActive(e, el) {
        if (e.type === "mouseenter") {
            if (!el.classList.contains("active")) {
                el.classList.add("active");
            }
        } else if (e.type === "mouseleave") {
            if (el.classList.contains("active")) {
                el.classList.remove("active");
            }
        }
    }
    function createElementWithClass(element, className = "") {
        var ele = document.createElement(element);
        if (className) {
            var classList = className.split(" ");
            classList.forEach(function (value, index) {
                ele.classList.add(value);
            });
        }
        return ele;
    }


    autosize(document.querySelectorAll('.textarea_style'));

    let drop_is_open = ''
    function autocomplete(inp, arr, valueFromArrOnly = false, defaultValue = "", filter_first_part = false) {

        let currentFocus;
        const arrow = inp.parentElement.parentElement.parentElement.getElementsByClassName("filter_arrow")[0]

        arrow.addEventListener("click", clickArrow);
        function clickArrow(){
            if (arrow.src.includes("close")){
                inp.value = inp.getAttribute("data-base-value")
                closeAllLists();
                inp.click()
            } else {
                if (inp.id == 'ticket_lang_buyer' || inp.id == 'ticket_lang_manufacturer' ) {
                    inp.value = ''
                }

                inp.click()
            }
        }

        inp.addEventListener("input", showAutocompleteList);
        inp.addEventListener("click", showAutocompleteList);
        inp.addEventListener("keydown", function(e) {
            var x = document.getElementById(this.id + "autocomplete-list");
            if (x) x = x.getElementsByTagName("div");
            if (e.keyCode == 40) {
                currentFocus++;
                addActive(x);
            } else if (e.keyCode == 38) {
                currentFocus--;
                addActive(x);
            } else if (e.keyCode == 13) {
                e.preventDefault();
                if (currentFocus > -1) {
                    if (x) x[currentFocus].click();
                }
            }
        });
        function addActive(x) {
            if (!x) return false;
            removeActive(x);
            if (currentFocus >= x.length) currentFocus = 0;
            if (currentFocus < 0) currentFocus = (x.length - 1);
            x[currentFocus].classList.add("autocomplete-active");
        }
        function removeActive(x) {
            for (var i = 0; i < x.length; i++) {
                x[i].classList.remove("autocomplete-active");
            }
        }
        function closeAllLists(elmnt) {

            var x = document.getElementsByClassName("autocomplete-items");
            for (var i = 0; i < x.length; i++) {
                if (elmnt != x[i] && elmnt != inp) {
                    x[i].parentNode.removeChild(x[i]);
                }
            }

            const arrow = inp.parentElement.parentElement.parentElement.getElementsByClassName("filter_arrow")[0]

            //console.log("inp.value ", inp.value)
            // console.log("base-value ", inp.getAttribute("data-base-value"))
            if (inp.value == inp.getAttribute("data-base-value")) {
                arrow.src = 'img/filter_arrow.svg'
                arrow.style.zIndex = 1


                if (inp.id == 'filter_analytic_product' || inp.id == 'filter_analytic_company'){
                    document.getElementById('div_analytic_container').style.display = 'none'
                    document.getElementById('div_btn_analytic_filter').style.display = 'block'
                }
                if (inp.id == 'workspace_filter_product' || inp.id == 'workspace_filter_company'){
                    document.getElementById('div_workspace_container').style.display = 'none'
                    document.getElementById('btn_workspace_filter').style.display = 'block'
                }
            }

            if (inp.value == '') {
                arrow.src = 'img/filter_arrow.svg'
                arrow.style.zIndex = 1
                inp.value = inp.getAttribute("data-base-value")
            }

            if (inp.id == 'ticket_lang_buyer' || inp.id == 'ticket_lang_manufacturer' ) {

                console.log("on closeAllLists lang ", main_data.cabinet_info.chat_lang)
                //translateTicketChat(inp.getAttribute("data-ticket-id"), "English")
                //inp.value = main_data.cabinet_info.chat_lang


                arrow.src = 'img/filter_arrow.svg'
            }


            if (inp.id == 'filter_order_product_m') {
                filter_orders.product = inp.value
                if (inp.value == "All products") {filter_orders.product = ''}
                filterOrders()
            }
            if (inp.id == 'filter_order_product_b') {
                filter_orders.product = inp.value
                if (inp.value == "All products") {filter_orders.product = ''}
                filterOrders()
            }
            if (inp.id == 'filter_order_company') {
                filter_orders.company = inp.value
                if (inp.value == "All customers") {filter_orders.company = ''}
                filterOrders()
            }
            if (inp.id == 'filter_order_invoice_m' && inp.value == "") {
                hideFoundedSupply()
            }
            if (inp.id == 'filter_order_invoice_b' && inp.value == "") {
                hideFoundedSupply()
            }


            if (inp.id == 'buyers_filter_company') {
                customers_filter.company = inp.value
                if (inp.value == "All customers") {customers_filter.company = ''}
                filterCustomers()
            }


            drop_is_open = ''
        }

        function showAutocompleteList(e) {

            if (["ticket_lang_manufacturer", "ticket_lang_buyer"].includes(inp.id)) {
                inp.value = ''
            }



            if (inp.id == 'filter_analytic_product' || inp.id == 'filter_analytic_company'){
                document.getElementById('div_analytic_container').style.display = 'none'
                document.getElementById('div_btn_analytic_filter').style.display = 'block'
            }
            if (inp.id == 'workspace_filter_product' || inp.id == 'workspace_filter_company'){
                document.getElementById('div_workspace_container').style.display = 'none'
                document.getElementById('btn_workspace_filter').style.display = 'block'
            }


            //console.log("val ", val)

            inp.selectionStart = inp.value.length;
            let a, b, i, k, val = this.value;


            closeAllLists();

            if (inp.value == inp.getAttribute("data-base-value")) {
                inp.value = ''
            }

            const arrow = inp.parentElement.parentElement.parentElement.getElementsByClassName("filter_arrow")[0]
            //arrow.classList.add('filter_close')
            arrow.src = 'img/close.svg'
            arrow.style.zIndex = 10


            console.log("val ", val)

            drop_is_open = inp.id

            currentFocus = -1;
            a = document.createElement("DIV");
            a.setAttribute("id", this.id + "autocomplete-list");
            a.setAttribute("class", "autocomplete-items");
            this.parentNode.appendChild(a);
            for (i = 0; i < arr.length; i++) {
                for (k = 0; k < 1; k++) {

                    let filter_rule_pass = true
                    if (filter_first_part){
                        filter_rule_pass = arr[i].substr(k, val.length).toUpperCase() == val.toUpperCase()
                    } else {
                        filter_rule_pass = arr[i].toUpperCase().includes(val.toUpperCase())
                    }

                    if (filter_rule_pass) {
                        b = document.createElement("DIV");
                        b.classList.add('autocomplete-item')
                        b.innerHTML = "<string>" + arr[i].substr(0, k) + "</string>";
                        b.innerHTML += "<string>" + arr[i].substr(k, val.length) + "</string>";
                        b.innerHTML += arr[i].substr(k + val.length);
                        b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                        b.addEventListener("click", function(e) {

                            console.log("inp.id ", inp.id)
                            console.log("inp.value ", inp.value)
                            inp.value = this.getElementsByTagName("input")[0].value;


                            if (inp.id == 'ticket_create_for_organization') {
                                let organization =  main_data.ticket_organizations.together.filter(function(item, i) {return item.name == inp.value})[0]
                                ticket_create.ticket_for_organization = organization
                                ticket_create.ticket_my_organization  = main_data.ticket_organizations.my

                                ticket_create.ticket_for_users = []
                                ticket_create.ticket_for_seems = []
                                document.getElementById("ticket_create_type").value = ''
                                document.getElementById("ticket_find_reciever").value = ''
                                document.getElementById("ticket_find_cc").value = ''
                                document.getElementById("div_ticket_industry").style.display = 'none'
                                document.getElementById("div_ticket_product").style.display = 'none'
                                document.getElementById("div_ticket_users").style.display = 'none'
                            }

                            closeAllLists();

                            if (inp.id == "ticket_create_type") {
                                if (inp.value == 'Product') {
                                    document.getElementById("div_ticket_product").style.display = 'block'
                                    document.getElementById("div_ticket_industry").style.display = 'none'
                                } else if (inp.value == 'Application') {
                                    document.getElementById("div_ticket_industry").style.display = 'block'
                                    document.getElementById("div_ticket_product").style.display = 'none'
                                } else {
                                    document.getElementById("div_ticket_industry").style.display = 'none'
                                    document.getElementById("div_ticket_product").style.display = 'none'
                                    //document.getElementById("btn_create_ticket").style.display = 'block'
                                    showTicketReciever()
                                }
                            }

                            if (inp.id == 'ticket_create_product' || inp.id == "ticket_create_industry") {
                                //document.getElementById("btn_create_ticket").style.display = 'block'
                                showTicketReciever()
                            }

                            if (inp.id == 'ticket_find_reciever') {
                                addUserToTicketReciever(inp.value)
                            }
                            if (inp.id == 'ticket_find_cc') {
                                addUserToTicketCC(inp.value)
                            }

                            if (inp.id == 'ticket_lang_buyer' || inp.id == 'ticket_lang_manufacturer' ) {
                                console.log("on click")
                                translateTicketChat(inp.getAttribute("data-ticket-id"), inp.value)
                                arrow.src = 'img/filter_arrow.svg'
                            }



                            if (inp.id == 'filter_order_product_m') {
                                filter_orders.product = inp.value
                                if (inp.value == "All products") {filter_orders.product = ''}
                                filterOrders()
                            }
                            if (inp.id == 'filter_order_product_b') {
                                filter_orders.product = inp.value
                                if (inp.value == "All products") {filter_orders.product = ''}
                                filterOrders()
                            }
                            if (inp.id == 'filter_order_company') {
                                filter_orders.company = inp.value
                                if (inp.value == "All customers") {filter_orders.company = ''}
                                filterOrders()
                            }

                            if (inp.id == 'filter_order_invoice_m') {
                                filter_orders.company = inp.value
                                if (inp.value != "") {
                                    findByInvoice(inp.value)
                                }
                            }
                            if (inp.id == 'filter_order_invoice_b') {
                                filter_orders.company = inp.value
                                if (inp.value != "") {
                                    findByInvoice(inp.value)
                                }
                            }

                            if (inp.id == 'buyers_filter_company') {
                                customers_filter.company = inp.value
                                if (inp.value == "All customers") {customers_filter.company = ''}
                                filterCustomers()
                            }


                            if (inp.id == 'project_create_type') {

                                project_type = inp.value.includes("replace") ? 'replace' : "add"
                                if (main_data.manufacturers_real.length > 1) {
                                    document.getElementById('div_project_create_manufacturer').style.display = 'block'
                                } else {
                                    project_manufacturer = main_data.manufacturers_real[0].name
                                    updateProjectProducts(project_manufacturer)
                                    if (project_type === 'replace') {
                                        document.getElementById('div_project_create_replace').style.display = 'block'
                                    }
                                    document.getElementById('div_project_create_our').style.display = 'block'
                                    document.getElementById('btn_project_add')       .style.display = 'block'
                                }


                            }


                            if (inp.id == 'project_create_manufacturer') {
                                project_type = document.getElementById('project_create_type').value.includes("replace") ? 'replace' : "add"
                                if (project_type === 'replace') {
                                    document.getElementById('div_project_create_replace').style.display = 'block'
                                }
                                project_manufacturer = inp.value
                                updateProjectProducts(project_manufacturer)
                                document.getElementById('div_project_create_our').style.display = 'block'
                                document.getElementById('btn_project_add')       .style.display = 'block'
                            }
                            //inp.dispatchEvent(new Event('input'));
                        });
                        a.appendChild(b);
                        break;
                    }
                }
            }
            if (val == 'All products' || val == 'All customers' ) {
                for (i = 0; i < arr.length; i++) {

                    b = document.createElement("DIV");
                    b.classList.add('autocomplete-item')
                    b.innerHTML = "<string></string>";
                    b.innerHTML += "<string>" + arr[i] + "</string>";
                    //b.innerHTML = arr[i]
                    b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                    b.addEventListener("click", function(e) {
                        inp.value = this.getElementsByTagName("input")[0].value;
                        closeAllLists();

                        if (inp.id == 'filter_order_product_m') {
                            filter_orders.product = inp.value
                            if (inp.value == "All products") {filter_orders.product = ''}
                            filterOrders()
                        }
                        if (inp.id == 'filter_order_product_b') {
                            filter_orders.product = inp.value
                            if (inp.value == "All products") {filter_orders.product = ''}
                            filterOrders()
                        }
                        if (inp.id == 'filter_order_company') {
                            filter_orders.company = inp.value
                            if (inp.value == "All customers") {filter_orders.company = ''}
                            filterOrders()
                        }
                        if (inp.id == 'filter_order_company') {
                            customers_filter.company = inp.value
                            if (inp.value == "All customers") {customers_filter.company = ''}
                            filterCustomers()
                        }
                        //inp.dispatchEvent(new Event('input'));
                    });
                    a.appendChild(b);


                }

            }

            if (!b) {
                b = document.createElement("DIV");
                b.innerHTML = "No matches";
                a.appendChild(b);
            }

        }

        document.addEventListener("click", function (e) {
            if (drop_is_open == inp.id ) {
                if (e.target != inp) {
                    closeAllLists(e.target);
                    if (valueFromArrOnly && !arr.includes(inp.value)) {
                        inp.value = defaultValue;
                    }

                    if (inp.id == 'ticket_lang_buyer' || inp.id == 'ticket_lang_manufacturer' ) {

                        inp.value = main_data.cabinet_info.chat_lang
                    }
                }
            }

        }, true);
    }


    function sendRequest(type, url, body = null) {
        const headers = {
            'Authorization': 'Token token=' + cookie_token,
            'Content-type': 'application/json'
        }

        return fetch(`${api_url}${url}`, {
            method: type,
            body: JSON.stringify(body),
            headers: headers
        }).then(response => {
            return response.json()
        })
    }


    function showNotify(text){
        var notification = alertify.notify(text, 'success', 5, function(){  console.log('dismissed'); });

    }

    function showAlert(text){

        document.getElementById(`popup_background_notify`).style.display = 'flex'
        document.getElementById(`div_background_notify`).style.display = 'flex'
        document.getElementById('notification_text').innerText = text
    }


    function arraySum(array){
        let sum = 0
        array.forEach(i => {
            sum += parseFloat(i)
        })
        return sum
    }

    // document.getElementById('popup_background').addEventListener('click', function(){
    //     closePopup()
    // })

    function showPopup(popup_name){
        console.log("showPopup ", popup_name)

        Array.from(document.querySelectorAll(".popups")).forEach(function(element) {
            element.style.display = 'none'
            if (element.getAttribute("data-popup-name") === popup_name ) {
                element.style.display = 'flex'
            }
        });
        document.getElementById(`popup_background`).style.display = 'flex'

        document.getElementById('project_reaction_main').style.display = 'block'
        document.getElementById(`btn_task_action_finish`).style.display = 'none'
        document.getElementById('feedback_value')    .value = ''
        document.getElementById('feedback_next_date').value = ''
        Array.from(document.getElementsByClassName("btns-project-reaction-wait")).forEach(function(element) {
            element.classList.remove('active')
        });

        document.getElementById('reaction_date').value = ''

        Array.from(document.getElementsByClassName("btns-project-reaction-finish")).forEach(function(element) {
            element.classList.remove('active')
        });

        document.getElementById('task_reaction_value').value = ''


        if (popup_name == 'product_supply_create'){
            // document.getElementById('supply_comment_value').value = ''

            Array.from(document.querySelectorAll(".btns-supply-incoterm")).forEach(function(element) {
                element.classList.remove("active")
            });
            Array.from(document.querySelectorAll(".btns-supply-currency")).forEach(function(element) {
                element.classList.remove("active")
            });
        }
    }
    Array.from(document.querySelectorAll(".open_popup")).forEach(function(element) {
        element.addEventListener('click', openPopup )
    })
    function openPopup(){
        console.log("openPopup")
        let popup_name = this.getAttribute("data-popup-name")
        showPopup(popup_name)

        let action     = this.getAttribute("data-action")
        edit_user_id    = this.getAttribute("data-user-id")
        edit_product_id    = this.getAttribute("data-product-id")
        edit_manufacturer_id    = this.getAttribute("data-manufacturer-id")

        const popup = document.querySelectorAll(`[data-popup-name="${popup_name}"]`)[1]

        switch (popup_name) {
            case 'manufacturer_add_product':
                Array.from(popup.getElementsByClassName("value")).forEach(function(element) {
                    console.log("element ")
                    element.classList.remove('edit')
                })
                document.getElementById('popup_product_name')       .value = ''
                document.getElementById('popup_product_type')       .value = ''
                document.getElementById('popup_product_raw')        .value = ''
                document.getElementById('popup_product_category')   .value = ''
                document.getElementById('popup_product_price_type') .value = ''
                document.getElementById('popup_product_price_value').value = ''
                document.getElementById('popup_product_min_count')  .value = ''
                document.getElementById('popup_product_industry')   .value = ''
                document.getElementById('popup_product_description').value = ''

                document.getElementById('check_specification_loaded').style.display = 'none'
                document.getElementById('delete_specification').style.display       = 'none'
                document.getElementById('div_upload_specification').style.display   = 'block'



                if (action === 'edit') {
                    document.getElementById('popup_product_price_value').classList.add('edit')
                    document.getElementById('popup_product_description').classList.add('edit')

                } else {
                    Array.from(popup.getElementsByClassName("value")).forEach(function(element) {
                        element.classList.add('edit')
                    })
                    manufacturer_product = {
                        action_type:   'create',
                        name:          '',
                        product_type:  '',
                        raw:           '',
                        category:      '',
                        price_type:    '',
                        price_value:   '',
                        min_count:     '',
                        industry:      '',
                        description:   '',
                        specification: '',
                        other_docs:    [],
                    }
                }
                break;

            case 'admin_users':
                clearUserPopup()

                admin_action_with_user = action
                document.getElementById('btn_admin_user_main_info').style.display = 'none'
                document.getElementById('admin_user_main_info').style.display     = 'block'

                console.log('action ', action)
                if (action === 'edit') {
                    document.getElementById('admin_user_main_info').style.display     = 'none'
                    document.getElementById('btn_admin_user_main_info').style.display = 'block'
                    getUserInfoAdmin(edit_user_id)
                } else {
                    main_data.products.forEach(function(item, i, arr) {
                        let new_item = item
                        new_item.selected = false
                        // user_products[user_products.length] = new_item
                        //  ` <div><img class="delete_address" data-position="${i}" src='img/close.svg'> ${item}</div> `
                    })
                    setUserProductsAdmin(user_products)
                }

                break;


        }
    }

    Array.from(document.querySelectorAll(".btn_close_popup")).forEach(function(element) {
        element.addEventListener('click', closePopup )
    });
    function closePopup(){
        document.getElementById(`popup_background`).style.display = 'none'
        document.getElementById('popup_background').style.opacity = '100%'
    }

    Array.from(document.querySelectorAll(".btn_close_chat")).forEach(function(element) {
        element.addEventListener('click', closeChat )
    });
    function closeChat(){
        document.getElementById('product_message_send').setAttribute("data-claimed", false)
        document.getElementById(`div_chat`).style.display = 'none'
    }

    Array.from(document.querySelectorAll(".btn_close_notify")).forEach(function(element) {
        element.addEventListener('click', closeNotify )
    });
    function closeNotify(){
        document.getElementById(`popup_background_notify`).style.display = 'none'
    }


    let firework_1 = null
    function showCongratsPage(header, text){
        document.getElementById('congrats_page').style.display = 'flex'
        document.getElementById('congrats_header').innerText = header
        document.getElementById('congrats_detail').innerText = text




        const options = {
            hue:       {min: 170, max: 220},
            delay:     {min: 100, max: 300},
            decay:     {min: 0.015, max: 0.03},
            particles: 150,
            intensity: 30,
            friction: 0.99,
            gravity:   2.4,
            traceSpeed: 3,
            explosion: 3.5,
        }
        const container_1 = document.querySelector('.firework_1')
        const container_2 = document.querySelector('.firework_2')
        const container_3 = document.querySelector('.firework_3')
        firework_1 = new Fireworks(container_1, options)
        //firework_2 = new Fireworks(container_2, options)
        //firework_3 = new Fireworks(container_3, options)

        firework_1.start()
        //firework_2.start()
        //firework_3.start()



        if (user_status == 'buyer') {
            Array.from(document.getElementsByClassName("client_container")).forEach(function(element) {
                element.classList.remove("visible")
            });

        } else if (user_status == 'manufacturer') {
            Array.from(document.getElementsByClassName("manufacturer_container")).forEach(function(element) {
                element.classList.remove("visible")
            });
        } else {

            Array.from(document.getElementsByClassName("login_container")).forEach(function(element) {
                element.classList.remove("visible")
            });
        }
    }
    document.getElementById('congrats_close').onclick = function() {
        document.getElementById('congrats_page').style.display = 'none'

        firework_1.stop()
        //firework_2.stop()
        //firework_3.stop()

        if (user_status == 'buyer') {
            Array.from(document.getElementsByClassName("client_container")).forEach(function(element) {
                element.classList.add("visible")
            });

        }else if (user_status == 'manufacturer') {
            Array.from(document.getElementsByClassName("manufacturer_container")).forEach(function(element) {
                element.classList.add("visible")
            });
        } else {

            Array.from(document.getElementsByClassName("login_container")).forEach(function(element) {
                element.classList.add("visible")
            });
        }
    }


    function formatNum(num, empty_if_null = false){

        const string = num.toString()
        const array = string.split("").reverse()

        let new_array = []
        array.forEach((element, i) => {

            new_array.push(element)
            if ([2,5,8,11].includes(i)) {
                new_array.push(" ")
            }
        });

        if (empty_if_null && num == 0) {
            new_array = [""]
        }

        return new_array.reverse().join("")
    }

    function countsUpOrDown(counts){
        let counts_first = counts[0]
        let counts_last  = counts[counts.length - 1]

        let direction = parseInt(counts_first) < parseInt(counts_last) ? 'up' : 'down'
        let img = `<img src="img/small_arrow_${direction}.svg"/>`

        if ( parseInt(counts_first) === parseInt(counts_last)) {
            img = ``
        }


        return {direction: direction, img: img}
    }


    function getCurrencySymbol(currency) {
        let symbol = '$'
        switch (currency){
            case "EUR":
                symbol = '€'
                break;
            case "CNY":
                symbol = '¥'
                break;
        }

        return symbol
    }


    function arraysEqual(a, b) {
        console.log("a ", a)
        console.log("b ", b)

        if (a === b) return true;
        console.log("1")
        if (a == null || b == null) return false;
        console.log("2")
        if (a.length !== b.length) return false;
        console.log("3")

        // If you don't care about the order of the elements inside
        // the array, you should sort both arrays here.
        // Please note that calling sort on an array will modify that array.
        // you might want to clone your array first.

        for (var i = 0; i < a.length; ++i) {

            console.log("4 a[i] ", a[i])
            console.log("4 b[i] ", b[i])

            if (a[i].id !== b[i].id) return false;
        }
        console.log("4")

        return true;
    }
    function getCountryIP(){
        fetch('https://api.ipregistry.co/?key=9hzox6jit8nby9y4')
            .then(function (response) {
                return response.json();
            })
            .then(function (payload) {
                console.log(payload.location.country.name + ', ' + payload.location.city)
                country_ip = payload.location.country.name

                if (window.location.href.includes("country=ru")){
                    setCookie(cookie_country, "Russian Federation")
                }

                let country_cookie = getCookie(cookie_country)
                if (country_cookie == "Russian Federation" || country_ip == "Russian Federation") {
                    document.querySelector(`.div_video_presentation_lang[data-lang="ua"]`).style.display = 'none'
                    document.querySelector(`.div_video_presentation_lang[data-lang="ru"]`).style.justifyContent = 'center'
                }
            });
    }

    function createDatePickers(){

        $('#feedback_next_date')  .datepicker({dateFormat: "dd.mm.yy", numberOfMonths: 1, firstDay: 1} )
        $('#reaction_date')       .datepicker({dateFormat: "dd.mm.yy", numberOfMonths: 1, firstDay: 1})

        $('#payment_date')        .datepicker({dateFormat: "dd.mm.yy", numberOfMonths: 1, firstDay: 1} )
        $('#supply_set_sale_date').datepicker({dateFormat: "dd.mm.yy", numberOfMonths: 1, firstDay: 1})
        $('#supply_payment_date') .datepicker({dateFormat: "dd.mm.yy", numberOfMonths: 1, firstDay: 1})
        $('#add_exchange_date')   .datepicker({dateFormat: "dd.mm.yy", numberOfMonths: 1, firstDay: 1})
        $('#supply_archive_start')   .datepicker({dateFormat: "dd.mm.yy", numberOfMonths: 1, firstDay: 1})
        $('#supply_archive_finish')   .datepicker({dateFormat: "dd.mm.yy", numberOfMonths: 1, firstDay: 1})
        $('#divide_order_new_date')   .datepicker({dateFormat: "dd.mm.yy", numberOfMonths: 1, firstDay: 1})
        $('#product_manufacturing_days_change')   .datepicker({dateFormat: "dd.mm.yy", numberOfMonths: 1, firstDay: 1})
        $('#product_manufacturing_date')   .datepicker({dateFormat: "dd.mm.yy", numberOfMonths: 1, firstDay: 1})
        $('#supply_set_eta_date')   .datepicker({dateFormat: "dd.mm.yy", numberOfMonths: 1, firstDay: 1})
    }

    function getRegionNameFromCode(region) {
        return region
    }
    function transformTag( tagData ){
        tagData.style = `
        --tag-bg:  rgba(98, 105, 128, 0.1);
        --tag-text-color: #8C94AD;
        --tag-remove-btn-color: #8C94AD;
        border: 1px solid #8C94AD;
        border-radius: 3px;`
    }

    function saveLoginToken(token){
        setCookie(cookie_name_token, token,   3600);
        cookie_token = getCookie(cookie_name_token);
    }
    function savePermanentToken(token){
        setCookie(cookie_name_permanent_token, token,   3600);
        cookie_permanent_token = getCookie(cookie_name_permanent_token);
    }

    function setCookie(name, value, days = 3600) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days*24*60*60*1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "")  + expires + "; path=/";
    }
    function getCookie(name) {
        var matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));

        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    function deleteCookie( name ) {
        document.cookie = name + '=undefined; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
    }

    function getDateToday(){
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = today.getFullYear();
        return  dd + '.' + mm + '.' + yyyy
    }

    function getRafName(raf_num){
        const rafs = ['Budget', 'RAF I', 'RAF II', 'RAF III', 'RAF IV']

        return rafs[raf_num]
    }
    function getMonthName(month_num){
        const monthes = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Year']

        return monthes[month_num - 1]
    }


    function deepEqual(x, y) {
        const ok = Object.keys, tx = typeof x, ty = typeof y;
        return x && y && tx === 'object' && tx === ty ? (
            ok(x).length === ok(y).length &&
            ok(x).every(key => deepEqual(x[key], y[key]))
        ) : (x === y);
    }
    function getFormattedDate(target_date) {

        let result = ``
        if (target_date.getDate() < 10) result += '0'
        result += target_date.getDate()  + '.'

        if (target_date.getMonth() + 1 < 10)  result += '0'
        result += (target_date.getMonth() + 1)  + '.'

        result += target_date.getFullYear()

        //${target_date.getDate()}.${target_date.getMonth() + 1}.${target_date.getFullYear()}
        return result;
    }
    function getDateOnlyMonth(target_date) {
        const monthes = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec']

        let t = new Date(target_date)
        let result = `${monthes[`${t.getMonth()}`]} ${t.getFullYear().toString()}`

        //${target_date.getDate()}.${target_date.getMonth() + 1}.${target_date.getFullYear()}
        return result;
    }

    Array.from(document.querySelectorAll(".btns_exit")).forEach(function(element) {
        element.addEventListener('click', () => {
            exitService()
        } );
    });

    function exitService(){
        deleteCookie(cookie_cart_name)
        deleteCookie(cookie_name_token)
        deleteCookie(cookie_name_permanent_token)
        deleteCookie(cookie_name_analytic)
        deleteCookie(cookie_name_workspace)
        deleteCookie(cookie_manufacturer_products)
        window.location.reload();
    }
});
