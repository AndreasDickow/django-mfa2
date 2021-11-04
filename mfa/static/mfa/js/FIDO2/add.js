function errorMessage (reason) {
  var existingDiv = document.getElementById('res');
  existingDiv.innerHTML="<div class='alert alert-danger'>Registration Failed as " + reason + "</div> ";
  addBeginButton('Try Again');
  addHomeLink('Go to Security Home');
}

function successMessage() {
  var existingDiv = document.getElementById('res');
  existingDiv.innerHTML="<div class='alert alert-success'>Registered Successfully</div>";
  addHomeLink(str(formData.get('success')));
}

function addBeginButton(label){
  var beginButton = $('<button>' + label + '</button>').attr( {
    id: 'begin_id',
    class: 'btn btn-success paddingr30',
    title: label,
  });
  $(beginButton).appendTo('#res');
  if (beginButton) {
    beginButton[0].addEventListener('mouseup', function e() {
      begin_reg();
    })
  }
}

function addHomeLink(label){
  var homeLink = $('<a>'+ label +'</a>').attr({
    id: 'go_home_link',
    class: 'btn btn-light',
    title: label,
  });
  $(homeLink).appendTo('#res');
  if (homeLink) {
    var formData = getFormData();
    homeLink[0].addEventListener('mouseup', function e() {
      $("#go_home_link").attr('href', formData.get('redirect'));
    })
  }
}

function getFormData(){
  return new FormData(document.getElementById('fido2_form'));
}

function begin_reg(){
    var formData = getFormData(); 
    formData.append('rbegin', $('#id_begin').attr('name'));
    fetch(formData.get('rbegin'),{}).then(function(response) {
      if(response.ok)
      {
          return response.arrayBuffer();
      }
      throw new Error('Error getting registration data!');
    }).then(CBOR.decode).then(function(options) {
        options.publicKey.attestation="direct"
        console.log(options)

      return navigator.credentials.create(options);
    }).then(function(attestation) {
      return fetch(formData.get('complete'), {
        method: 'POST',
        headers: {'Content-Type': 'application/cbor'},
        body: CBOR.encode({
          "attestationObject": new Uint8Array(attestation.response.attestationObject),
          "clientDataJSON": new Uint8Array(attestation.response.clientDataJSON),
        })
      });
    }).then(function(response) {

        var stat = response.ok ? 'successful' : 'unsuccessful';
        return response.json()
    }).then(function (res)
        {
      if (res["status"] =='OK')
          successMessage();
        else
          var reason = res["message"];
          errorMessage(reason);
    }, function(reason) {
        errorMessage(reason);
    })
    }

document.addEventListener('DOMContentLoaded', function () {
    ua=new UAParser().getResult()
    if (ua.browser.name == "Safari")
    {
      addBeginButton('Start');
    }
    else
    {
      setTimeout(begin_reg, 500)
    }
})