from django.shortcuts import render
from django.http import HttpResponse,HttpResponseRedirect
from .models import *
try:
    from django.urls import reverse
except:
    from django.core.urlresolvers import reverse
from django.template.context_processors import csrf
from django.template.context import RequestContext
from django.conf import settings
from . import TrustedDevice
from django.contrib.auth.decorators import login_required
from user_agents import parse
from django.utils.translation import gettext_lazy as _

transdict = {
    # MFA.html
    "add_method": _("Methode hinzufügen"),          #{% trans 'Add Method' %}
    "auth_app": _("Authenticator App"),             #{% trans 'Authenticator app' %}
    "email_token": _("Email Token"),                #{% trans 'Email Token' %}
    "security_key": _("Sicherheitsschlüssel"), #{% trans 'Security Key' %}
    "security_fido2_key": _("FIDO2 Sicherheitsschlüssel"), #{% trans 'FIDO2 Security Key' %}
    "trusted_device": _("Vertrautes Gerät"),        #{% trans 'Trusted Device' %}
    "type": _("Typ"),                  #{% trans 'Type' %}
    "date_added": _("Hinzugefügt am"),        #{% trans 'Date Added' %}
    "expires_on": _("Läuft aus am"),        #{% trans 'Expires On' %}
    "device": _("Gerät"),        #{% trans 'Device' %}
    "last_used": _("Zuletzt benutzt"),        #{% trans 'Last Used' %}
    "status": _("Status"),        #{% trans 'Status' %}
    "delete": _("Löschen"),        #{% trans 'Delete' %}
    "on": _("An"),  #{% trans 'On' %}
    "off": _("Aus"),  # {% trans 'Off' %}
    "no_keys_yet": _("Sie besitzen noch keine Schlüssel."),  #{% trans 'You did not have any keys yet.' %}
    
    # modal.html
    "close": _("Schließen"), #{% trans 'Close' %}
    
    # select_mfa_method.html
    "select_second_ver": _("Zweite Verifizierungsmethode auswählen"), #{% trans 'Select Second Verification Method' %}
    #     {% trans 'Authenticator App' %}
    "send_otp": _("OTP per E-Mail senden"),#     {% trans 'Send OTP by Email' %}
    #     {% trans 'Secure Key' %}
    #     {% trans 'FIDO2 Secure Key' %}

    # # FIDO2/Add.html
    # # {% trans 'FIDO2 Security Key' %}
    # "added_successfully": _("Ihr Gerät wurde erfolgreich hinzugefügt."), # {% trans 'Your device is added successfully.' %}
    # "confirm_identity": _("Ihr Browser sollte Sie auffordern, Ihre Identität zu bestätigen"),     # {% trans 'Your browser should ask you to confirm you identity.' %}

    # # FIDO2/recheck.html
    # # {% trans 'Security Key' %}
    # "welcome_back": _("Willkommen zurück"),# {% trans 'Welcome back' %}
    # "not_me": _("Nicht ich"),# {% trans 'Not me' %}
    # "press_button": _("Drücken Sie bitte die Taste auf Ihrem Sicherheitsschlüssel, um zu beweisen, dass Sie es sind."),# {% trans 'please press the button on your security key to prove it is you.' %}
    # "select_another": _("Andere Methode wählen"),# {% trans 'Select Another Method' %}

    # U2F/Add.html
    "adding": _("Sicherheitsschlüssel hinzufügen"),# {% trans 'Adding Security Key' %}
    # {% trans 'Your device is added successfully.' %}
    "flashing": _("Ihr Sicherheitsschlüssel sollte jetzt blinken, bitte drücken Sie auf die Taste."),# {% trans 'Your secure Key should be flashing now, please press on button.' %}

    # U2F/recheck.html
    # {% trans "Your key should be flashing now, please press the button." %}
    "secure_context": _("U2F muss in einem sicheren Kontext funktionieren."),# {% trans "U2F must work under secure context" %}
    # {% trans "Select Another Method" %}


}


@login_required
def index(request):
    keys=[]
    context={"keys":User_Keys.objects.filter(username=request.user.username),"UNALLOWED_AUTHEN_METHODS":settings.MFA_UNALLOWED_METHODS
             ,"HIDE_DISABLE":getattr(settings,"MFA_HIDE_DISABLE",[])}
    for k in context["keys"]:
        if k.key_type =="Trusted Device" :
            setattr(k,"device",parse(k.properties.get("user_agent","-----")))
        elif k.key_type == "FIDO2":
            setattr(k,"device",k.properties.get("type","----"))
        keys.append(k)
    context["keys"]=keys
    context["transdict"]=transdict
    return render(request,"MFA.html",context)

def verify(request,username):
    request.session["base_username"] = username
    #request.session["base_password"] = password
    keys=User_Keys.objects.filter(username=username,enabled=1)
    methods=list(set([k.key_type for k in keys]))

    if "Trusted Device" in methods and not request.session.get("checked_trusted_device",False):
        if TrustedDevice.verify(request):
            return login(request)
        methods.remove("Trusted Device")
    request.session["mfa_methods"] = methods
    if len(methods)==1:
        return HttpResponseRedirect(reverse(methods[0].lower()+"_auth"))
    return show_methods(request)

def show_methods(request):
    context = {}
    context["transdict"] = transdict
    return render(request,"select_mfa_method.html", context)

def reset_cookie(request):
    response=HttpResponseRedirect(settings.LOGIN_URL)
    response.delete_cookie("base_username")
    return response
def login(request):
    from django.contrib import auth
    from django.conf import settings
    callable_func = __get_callable_function__(settings.MFA_LOGIN_CALLBACK)
    return callable_func(request,username=request.session["base_username"])

# def dictionary(request):
#     import json
#     with open('IHMWEB/json_file.json') as data_file:    
#         data = json.load('django-mfa2/mfa/translations.json')
#     # c = {'user_username': request.session['user_username'],
#     #      "data"         : data}
#     # context = Context(c)

#     # template = get_template('view.html')
#     translations.activate(settings.LANGUAGE_CODE)
#     html = template.render(context)    
#     return HttpResponse(html)

@login_required
def delKey(request):
    key=User_Keys.objects.get(id=request.POST["id"])
    if key.username == request.user.username:
        key.delete()
        return HttpResponse("Deleted Successfully")
    else:
        return HttpResponse("Error: You own this token so you can't delete it")

def __get_callable_function__(func_path):
    import importlib
    if not '.' in func_path:
        raise Exception("class Name should include modulename.classname")

    parsed_str = func_path.split(".")
    module_name , func_name = ".".join(parsed_str[:-1]) , parsed_str[-1]
    imported_module = importlib.import_module(module_name)
    callable_func = getattr(imported_module,func_name)
    if not callable_func:
        raise Exception("Module does not have requested function")
    return callable_func

@login_required
def toggleKey(request):
    id=request.GET["id"]
    q=User_Keys.objects.filter(username=request.user.username, id=id)
    if q.count()==1:
        key=q[0]
        if not key.key_type in settings.MFA_HIDE_DISABLE:
            key.enabled=not key.enabled
            key.save()
            return HttpResponse("OK")
        else:
            return HttpResponse("You can't change this method.")
    else:
        return HttpResponse("Error")

def goto(request,method):
    return HttpResponseRedirect(reverse(method.lower()+"_auth"))
