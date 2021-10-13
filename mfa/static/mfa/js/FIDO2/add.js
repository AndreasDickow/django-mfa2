function begin_reg(){
    var formData = new FormData(document.getElementById('fido2_form')); 
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
            $("#res").html("<div class='alert alert-danger'>Registration Failed as " + res["message"] + ", <a href='javascript:void(0)' onclick='begin_reg()'> try again or <a href='"+formData.get('home')+"'> Go to Security Home</a></div>")


    }, function(reason) {
       $("#res").html("<div class='alert alert-danger'>Registration Failed as " +reason +", <a href='javascript:void(0)' onclick='begin_reg()'> try again </a> or <a href='"+formData.get('home')+"'> Go to Security Home</a></div>")
    })
    }

document.addEventListener('DOMContentLoaded', function () {
    // $(document).ready(function (){
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