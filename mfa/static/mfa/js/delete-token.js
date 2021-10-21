function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

docReady(function() {
    $.get('CSRFTokenManager.do', function(data) {
        var send = XMLHttpRequest.prototype.send,
        token =data;
        document.cookie='X-CSRF-Token='+token;
        XMLHttpRequest.prototype.send = function(data) {
            this.setRequestHeader('X-CSRF-Token',token);
            //dojo.cookie("X-CSRF-Token", "");
     
            return send.apply(this, arguments);
        };
     });
     deleteButtonListener();
});

function toggleKey(id,toggle_url) {
    $.ajax({
        url:toggle_url,
        success:function (data) {
            if (data == "Error")
                $("#toggle_"+id).toggle()

        },
        error:function (data) {
            $("#toggle_"+id).toggle()
        }
    })
}

function deleteButtonListener() {
    const deleteButton = document.getElementById('delete-key-mfa')
    //deleteKey(deleteButton);
    deleteButton.addEventListener('click', function() {
        //get value attributes from delete-key-mfa
        var name= $(this).attr("name");
        var id= $(this).attr("value");
        var confirm_url= $(this).attr("url");

        //set html content
        $("#modal-title").html("Confirm Delete");
        $("#modal-body").html("Are you sure you want to delete '"+name+"'? you may lose access to your system if this your only 2FA.");
        $("#actionBtn").remove();
        var actionBtn = $('<button>Confirm Deletion</button>').attr( {
            id: 'actionBtn',
            class: 'btn btn-danger',
            title: 'Confirm Deletion',
        });
        actionBtn[0].addEventListener('click', function confirmDel() {
            $.ajax({
                    url:confirm_url,
                    method: "post",
                    xhrFields: {
                        withCredentials: true
                    },
                    data:{"id":id},
                    success:function (data) {
                        alert(data)
                        window.location.reload();
                    }
                });
        });
        $("#modal-footer").prepend(actionBtn)
        $("#popUpModal").modal()
    });
}