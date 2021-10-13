

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('send-email-trusted')
            .addEventListener('click', function sendEmail() {
                $("#modal-title").html("Send Link")
                $("#modal-body").html("Sending Email, Please wait....");
                $("#popUpModal").modal();
                $.ajax({
                    "url":"{% url 'td_sendemail' %}",
                    success:function (data) {
                        alert(data);
                        $("#popUpModal").modal('toggle')

                    }
    })});
}),
function failedMFA() {
    $("#modal-body").html("<div class='alert alert-danger'>Failed to validate you, please <a href='javascript:void(0)' onclick='getUserAgent()'>try again</a></div>")
}
function checkMFA() {
    recheck_mfa(trustDevice,failedMFA,true)
}
function trustDevice() {

    $.ajax(
        {

            "url":"{% url 'td_trust_device' %}",
            success: function (data) {
                if (data == "OK")
                {
                    alert("Your are done, your device should show final confirmation")
                    window.location.href="{% url 'mfa_home' %}"

                }
            }
        }
    )
}
function getUserAgent() {
    $.ajax({
        "url":"{% url 'td_get_useragent' %}",success: function(data)
        {
            if (data == "")
                setTimeout('getUserAgent()',5000)
            else
            {
                $("#modal-title").html("Confirm Trusted Device")
                $("#actionBtn").remove();
                $("#modal-footer").prepend("<button id='actionBtn' class='btn btn-success' onclick='checkMFA()'>Trust Device</button>")
                $("#modal-body").html(data)
                $("#popUpModal").modal()
            }
        }
    })

}
$(document).ready(getUserAgent())


// function sendEmail() {
//     $("#modal-title").html("Send Link")
//     $("#modal-body").html("Sending Email, Please wait....");
//     $("#popUpModal").modal();
//     $.ajax({
//         "url":"{% url 'td_sendemail' %}",
//         success:function (data) {
//             alert(data);
//             $("#popUpModal").modal('toggle')

//         }
//     })
// }
// function failedMFA() {
//     $("#modal-body").html("<div class='alert alert-danger'>Failed to validate you, please <a href='javascript:void(0)' onclick='getUserAgent()'>try again</a></div>")
// }
// function checkMFA() {
//     recheck_mfa(trustDevice,failedMFA,true)
// }
// function trustDevice() {

//     $.ajax(
//         {

//             "url":"{% url 'td_trust_device' %}",
//             success: function (data) {
//                 if (data == "OK")
//                 {
//                     alert("Your are done, your device should show final confirmation")
//                     window.location.href="{% url 'mfa_home' %}"

//                 }
//             }
//         }
//     )
// }
// function getUserAgent() {
//     $.ajax({
//         "url":"{% url 'td_get_useragent' %}",success: function(data)
//         {
//             if (data == "")
//                 setTimeout('getUserAgent()',5000)
//             else
//             {
//                 $("#modal-title").html("Confirm Trusted Device")
//                 $("#actionBtn").remove();
//                 $("#modal-footer").prepend("<button id='actionBtn' class='btn btn-success' onclick='checkMFA()'>Trust Device</button>")
//                 $("#modal-body").html(data)
//                 $("#popUpModal").modal()
//             }
//         }
//     })

// }
// $(document).ready(getUserAgent())