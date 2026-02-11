(() => {
    const deny = async() => {
        throw new DOMException (
            "Operation is not allowed",
            "NotAllowedError"
        );
    }
    if (!navigator.credentials) return; // check for the existence of the credentials API before attempting to override it
    
    const originalCreate = navigator.credentials.create;
    navigator.credentials.create = async function (options) {
        if (options?.publicKey) {
            console.warn("Passkey creation detected and successfully blocked!");
            throw new DOMException (
                "Passkey creation has been blocked by Passkey Blocker extension.",
                "NotAllowedError"
            );
        }
        return originalCreate.apply(this, arguments);
    }
    // Add stronger enforcement later to prevent bypassing the override by directly calling PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable
    if (window.PublicKeyCredential) {
        PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable = async () => false;
    }
    if ("PublicKeyCredential" in window) {
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
})