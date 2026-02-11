/* Message to website operators:
I like passkeys cause they are convenient and secure but...

Don't spam multiple passkey creation prompts to users!
This causes you to be unable to do anything else in the browser
until the passkey creation is cancelled, which is disruptive and
can lead to users abandoning your site out of frustration. */

// TODO: Create a popup UI when the extension is clicked
// TODO: Add an option to deny passkey creation on specific sites (blacklist)
// TODO: Autodetect multiple denied passkey creation attempts and ask user if they want to block passkey creation on that site

(() => {
    const deny = async() => {// Deny function for blocking WebAuthn operations
        throw new DOMException (
            "Operation is not allowed",
            "NotAllowedError"
        );
    }

    const throwNotAllowed = () => {// Function for throwing NotAllowedError when WebAuthn operations are attempted
        throw new DOMException (
            "WebAuthn Passkey Creation has been blocked by Passkey Gatekeeper",
            "NotAllowedError"
        );
    };

    const blockIfWebAuthn = (options) => {// Function for blocking WebAuthn if options contain publicKey
        if (options && options.publicKey) {
            console.warn("WebAuthn Passkey Creation blocked.");
            throwNotAllowed();
        }
    }
    
    if (!navigator.credentials) return; // check for the existence of the credentials API before attempting to override it
    
    const originalCreate = navigator.credentials.create;
    navigator.credentials.create = async function (options) {
        if (options?.publicKey) {
            console.warn("Passkey creation detected and successfully blocked!");
            throw new DOMException (
                "Passkey creation has been blocked by Passkey Gatekeeper.",
                "NotAllowedError"
            );
        }
        return originalCreate.apply(this, arguments);
    }
    // Stronger enforcement
    if (window.PublicKeyCredential) {
        PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable = async () => false;
    }
    if ("PublicKeyCredential" in window) {// Checking for PublicKeyCredential
        try {
            Object.defineProperty(window.PublicKeyCredential, "isUserVerifyingPlatformAuthenticatorAvailable", {
                value: undefined,
                writable: false,
                configurable: false
            });
        } 
        catch (e) {}
    }
    if (!navigator.credentials) return;

    // Override create()
    Object.defineProperty(navigator.credentials, "create", {
        value: async function (options) {
            blockIfWebAuthn(options);
            return throwNotAllowed();
        },
        writable: false,
        configurable: false
    });

    // Override get() just in case
    Object.defineProperty(navigator.credentials, "get", {
        value: async function (options) {
            blockIfWebAuthn(options);
            return throwNotAllowed();
        }
    });
    // Prevent capability detection bypass
    const disableCapabilityCheck = async () => false;
    if (window.PublicKeyCredential) {
        Object.defineProperty(PublicKeyCredential, "isUserVerifyingPlatformAuthenticatorAvailable", {
            value: disableCapabilityCheck,
            writable: false,
            configurable: false
        });
        Object.defineProperty(PublicKeyCredential, "isConditionalMediationAvailable", {
            value: disableCapabilityCheck,
            writable: false,
            configurable: false
        }
        )
    }

    // Tampering prevention
    try {
        Object.freeze(navigator.credentials);
    } catch (e) {}
})();