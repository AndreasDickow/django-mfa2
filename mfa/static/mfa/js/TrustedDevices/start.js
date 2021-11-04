document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('send-email-trusted')
            .addEventListener('click', function sendEmail() {
                $("#modal-title").html("Send Link")
                $("#modal-body").html("Sending Email, Please wait....");
                $("#popUpModal").modal();
                $.ajax({
                    url:$('input#td_sendemail').data('url'),
                    success:function (data) {
                        alert(data);
                        $("#popUpModal").modal('toggle')

                    }
    })});
}),
function failedMFA() {
    addAgainButton();
}
function checkMFA() {
    recheck_mfa(trustDevice,failedMFA,true)
}
function trustDevice() {
    $.ajax(
        {
            url:$('input#td_trust_device').data('url'),
            success: function (data) {
                if (data == "OK")
                {
                    alert("Your are done, your device should show final confirmation")
                    window.location.href=$('input#mfa_home').data('url')

                }
            }
        }
    )
}
function getUserAgent() {
    $.ajax({
        url:$('input#td_get_uesr_agent').data('url'),
        success: function(data)
        {
            if (data == "")
                setTimeout('getUserAgent()',5000)
            else
            {
                $("#modal-title").html("Confirm Trusted Device")
                $("#actionBtn").remove();
                addTrustDeviceButton();
                $("#modal-body").html(data)
                $("#popUpModal").modal()
            }
        }
    })
}

function addAgainButton(){
    var existingDiv = document.getElementById('modal-body');
    existingDiv.innerHTML="<div class='alert alert-danger'>Failed to validate you, please try again.</div>";

    var againButton = $('<button>Try Again</button>').attr( {
      id: 'again-button',
      class: 'btn btn-success',
      title: 'Try Again',
    });
    $(againButton).appendTo('#modal-body');
    if (againButton) {
      againButton[0].addEventListener('mouseup', function e() {
        getUserAgent();
      })
    }
}

function addTrustDeviceButton(){
    var actionButton = $('<button>Trust Device</button>').attr( {
        id: 'actionBtn',
        class: 'btn btn-success',
        title: 'Trust Device',
    });
    $('#modal-footer').prepend(actionButton);
    if (actionButton) {
        actionButton[0].addEventListener('mouseup', function e() {
        checkMFA();
        })
    }
}

$(document).ready(getUserAgent())