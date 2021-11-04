function addAuthenButton(label, appendTo) {
  var authenButton = $('<button>' + label + '</button>').attr( {
    id: 'authen',
    class: 'btn btn-success',
    title: label,
  });
  $(authenButton).appendTo(appendTo);
  if (authenButton) {
    authenButton[0].addEventListener('mouseup', function e() {
      authen();
    })
  }
}

function addBackButton(appendTo) {
  var backLink = $('<a>Go Back</a>').attr({
    id: 'go_back_link',
    class: 'btn btn-light',
    title: 'Go Back'
  });
  $(backLink).appendTo(appendTo);
  if (backLink) {
    backLink[0].addEventListener('mouseup', function e() {
      history.back();
    })
  }
}

function errorMessage(reason) {
  var existingDiv = document.getElementById('msgdiv');
  existingDiv.innerHTML="<div class='alert alert-danger'>Verification Failed as " + reason + ".";
  addAuthenButton('Try Again', '#msgdiv');
  addBackButton('#msgdiv');
}

function authen() {
  const begin_url = $('#begin').attr('value');
  const complete_url = $('#u2f_login').attr('action');
  const mode = $('#u2f_login').attr('name') === 'complete'?'auth':'recheck';
  fetch(begin_url, {
    method: 'GET',
  }).then(function(response) {
  if(response.ok) return response.arrayBuffer();
    throw new Error('No credential available to authenticate!');
  }).then(CBOR.decode).then(function(options) {
    console.log(options)
    return navigator.credentials.get(options);
  }).then(function(assertion) {
    res=CBOR.encode({
      "credentialId": new Uint8Array(assertion.rawId),
      "authenticatorData": new Uint8Array(assertion.response.authenticatorData),
      "clientDataJSON": new Uint8Array(assertion.response.clientDataJSON),
      "signature": new Uint8Array(assertion.response.signature)
    });

    return fetch(complete_url, {
      method: 'POST',
      headers: {'Content-Type': 'application/cbor'},
      body:res,
    }).then(function (response) {if (response.ok) return res = response.json()}).then(function (res) {
      if (res.status=="OK")
      {
        $("#msgdiv").addClass("alert alert-success").removeClass("alert-danger")
        $("#msgdiv").html("Verified....please wait")
        if(mode == "auth"){
          window.location.href=res.redirect;
        }
        else if(mode === "recheck"){
          mfa_success_function();
        }
      }
      else {
        var reason = res.message;
        $("#msgdiv").addClass("alert alert-danger").removeClass("alert-success");
        errorMessage(reason);
        if(mode === "recheck"){
          mfa_failed_function();
        }
      }
    })
  })
}

document.addEventListener('DOMContentLoaded', function () {
  if (location.protocol != 'https:') {
      $("#main_paragraph").addClass("alert alert-danger")
      $("#main_paragraph").html("FIDO2 must work under secure context")
  } else {
      ua=new UAParser().getResult()
      if (ua.browser.name == "Safari") {
        addAuthenButton('Authenticate', '#res');
      }
      else {
        authen();
      }
  }
});