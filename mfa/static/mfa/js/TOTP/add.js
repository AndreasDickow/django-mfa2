var key="";
function addToken() {
    var dataurl = $("#answer").attr("data-url");
    $.ajax({
        "url":dataurl,dataType:"JSON",
        success:function (data) {
            window.key=data.secret_key;
            var qr = new QRious({
      element: document.getElementById('qr'),
      value: data.qr
    });
            $("#second_step").show()
        }
    })
}


document.addEventListener('DOMContentLoaded', function () {

// $(document).ready(function addToken() {
    addToken();
});

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('verify-totp')
            .addEventListener('click', function verify() { 
                answer=$("#answer").val()
                var dataurl = $("#verify-totp").attr("data-url");
                $.ajax({
                    "url": dataurl.toString()+"?key="+key+"&answer="+answer,
                    success:function (data) {
                        if (data == "Error")
                            alert("You entered wrong numbers, please try again")
                        else
                        {
                            alert("Your authenticator is added successfully.")
                            window.location.href="{{ redirect_html }}"
                        }
                    }
                })
            });

    document.getElementById('show-totp')
            .addEventListener('click', function showTOTP() {
                $("#modal-title").html("One Time Password Apps")
                html="<div class='row'><ul>"+
                    "<li>Android: <a href='https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2' target='_blank'>Google Authenticator</a> | <a href='https://play.google.com/store/apps/details?id=com.authy.authy' target='_blank'>Authy</a></li>"
                html+="<li>iPhone/iPad: <a href='https://itunes.apple.com/us/app/authy/id494168017' target='_blank'>Authy</a></li> "
                html+="<li>Chrome: <a href='https://chrome.google.com/webstore/detail/authenticator/bhghoamapcdpbohphigoooaddinpkbai?hl=en'>Google Authenticator</a> | <a href='https://chrome.google.com/webstore/detail/authy/gaedmjdfmmahhbjefcbgaolhhanlaolb?hl=en' target='_blank'>Authy</a></li>"
                html+="</ul></div>"
                $("#modal-body").html(html)
                $('#popUpModal').modal('show')
            });

    document.getElementById('show-key-totp')
            .addEventListener('click', function showKey() {
                $("#modal-title").html("Your Secret Key")
                $("#modal-body").html("<pre>"+window.key+"</pre>")
                $("#popUpModal").modal('show')
            });
});

    





// var key="";
// $(document).ready(function addToken() {
//     $.ajax({
//         "url":"{% url 'get_new_otop' %}",dataType:"JSON",
//         success:function (data) {
//             window.key=data.secret_key;
//             var qr = new QRious({
//       element: document.getElementById('qr'),
//       value: data.qr
//     });
//             $("#second_step").show()
//         }
//     })
// });

// function showKey() {
//     $("#modal-title").html("Your Secret Key")
//     $("#modal-body").html("<pre>"+window.key+"</pre")
//     $("#popUpModal").modal('show')
// }

// function verify() {
//     answer=$("#answer").val()
//     $.ajax({
//         "url":"{% url 'verify_otop' %}?key="+key+ "&answer="+answer,
//         success:function (data) {
//             if (data == "Error")
//                 alert("You entered wrong numbers, please try again")
//             else
//             {
//                 alert("Your authenticator is added successfully.")
//                 window.location.href="{{ redirect_html }}"
//             }
//         }
//     })
// }

// function showTOTP() {
//     $("#modal-title").html("One Time Password Apps")
//     html="<div class='row'><ul>"+
//         "<li>Android: <a href='https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2' target='_blank'>Google Authenticator</a> | <a href='https://play.google.com/store/apps/details?id=com.authy.authy' target='_blank'>Authy</a></li>"
//     html+="<li>iPhone/iPad: <a href='https://itunes.apple.com/us/app/authy/id494168017' target='_blank'>Authy</a></li> "
//     html+="<li>Chrome: <a href='https://chrome.google.com/webstore/detail/authenticator/bhghoamapcdpbohphigoooaddinpkbai?hl=en'>Google Authenticator</a> | <a href='https://chrome.google.com/webstore/detail/authy/gaedmjdfmmahhbjefcbgaolhhanlaolb?hl=en' target='_blank'>Authy</a></li>"
//     html+="</ul></div>"
//     $("#modal-body").html(html)
//     $('#popUpModal').modal('show')
// }