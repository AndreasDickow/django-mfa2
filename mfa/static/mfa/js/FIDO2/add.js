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
            $("#res").html("<div class='alert alert-success'>Registered Successfully, <a href='"+formData.get('redirect')+"'> "+formData.get('success')+"</a></div>")
        else
            $("#res").html("<div class='alert alert-danger'>Registration Failed as " + res["message"] + ", <a href='javascript:void(0)' onclick='begin_reg()' id='begin_id2'> try again or <a id='go_home_link2'> Go to Security Home</a></div>")


    }, function(reason) {

      document.getElementById('res').innerHTML = "<div class='alert alert-danger'>Registration Failed as " +reason +", <a href='#' id='begin_id' onclick='begin_reg()'> try again </a> or <a href='' id='go_home_link'> Go to Security Home</a></div>";
      // comment: $("#res").html("<div class='alert alert-danger'>Registration Failed as " +reason +", <a href='javascript:void(0)' onclick='begin_reg()'> try again </a> or <a href='"+formData.get('home')+"'> Go to Security Home</a></div>")
    })
    }

document.addEventListener('DOMContentLoaded', function () {
  var checkExist = setInterval(function() {
    if ($('#go_home_link').length) {
      var formData = getFormData();
      document.getElementById("go_home_link").setAttribute("href", formData.get('redirect'));
      clearInterval(checkExist);
    }
  }, 100); 

    ua=new UAParser().getResult()
    if (ua.browser.name == "Safari")
    {
      $("#res").html("<button class='btn btn-success' onclick='begin_reg()'>Start...</button>")
    }
    else
    {
      setTimeout(begin_reg, 500)
    }
})


// $(window).ready(function(){
// document.getElementById('go_home_link')
//   .addEventListener('click', function goHomeLink(){
  
//   var formData = getFormData();
//   document.getElementById("go_home_link").setAttribute("href", formData.get('redirect'));
// });
// });