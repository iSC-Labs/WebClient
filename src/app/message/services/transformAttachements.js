/* @ngInject */
function transformAttachements(embedded, $rootScope) {
    return (body, message, { action }) => {
        /**
         * Usefull when we inject the content into the message (load:manual)
         */
        action &&
            $rootScope.$emit('message.open', {
                type: 'embedded.injected',
                data: {
                    action: 'user.inject.load',
                    map: {},
                    message,
                    body: body.innerHTML
                }
            });

        /*
             * If all the attachments are cached (e.g. PGP/MIME messages) this can actually resolve instantly: which causes a problem
             * because the message directive is not yet loaded to catch the message.embedded.
             * Solution, apply it later using async.
             * Tip: you can check this by stepping through the code of the whole parser: there will be no promises in this case.
             * or the promises will just instantly resolve.
             * I think this normally doesn't happen because we clear the cache after each conversation is closed.
             */
        $rootScope.$applyAsync(() =>
            embedded.parser(message, { direction: 'blob', text: body.innerHTML }).then(() =>
                $rootScope.$emit('message.embedded', {
                    type: 'loaded',
                    data: { message, body, action }
                })
            )
        );

        return body;
    };
}
export default transformAttachements;
