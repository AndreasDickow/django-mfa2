document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('recheck-send-totp')
            .addEventListener('click', function send_totp() { 

                if($(this).attr("mode")=="recheck"){

                    $.ajax({"url":"{% url 'totp_recheck' %}", method:"POST",dataType:"JSON",
                        data:{"csrfmiddlewaretoken":"{{ csrf_token }}","otp":$("#otp").val()},
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


//  comment: should be script type="application/javascript"