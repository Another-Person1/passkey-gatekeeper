(() => {
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
    // Add stronger enforcement
    if (window.PublicKeyCredential) {
        PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable = async () => false;
    }
})