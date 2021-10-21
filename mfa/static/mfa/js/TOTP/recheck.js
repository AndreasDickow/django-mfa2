document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('recheck-send-totp')
            .addEventListener('click', function send_totp() { 
                if($(this).attr("mode")=="recheck"){
                    var dataurl = $("#recheck-send-totp").attr("data-url");
                    var formData = new FormData(form);
                    $.ajax({"url":dataurl, method:"POST",dataType:"JSON",
                        data:{"csrfmiddlewaretoken":formData.get('csrf_token'),"otp":$("#otp").val()},
                        success:function (data) {
                            if (data["recheck"])
                                mfa_success_function();
                            else {
                                mfa_failed_function();
                            }
                        }
                    })
                }
            });
})