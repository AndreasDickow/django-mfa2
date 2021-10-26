document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('recheck-mail')
    .addEventListener('click', function send_totp() {
        var dataurl = $("#recheck-mail").attr("data-url");
        var form = document.getElementById("formLogin");
        var formData = new FormData(form);
        $.ajax({"url": dataurl, method:"POST",dataType:"JSON",
            data:{"csrfmiddlewaretoken":formData.get('csrf_token'),"otp":$("#otp").val()},
            //comment: data:{"csrfmiddlewaretoken":"{{ csrf_token }}","otp":$("#otp").val()}, 
            success:function (data) {
                if (data["recheck"])
                    mfa_success_function();
                else {
                    mfa_failed_function();
                }
            }
        })
    }
)})