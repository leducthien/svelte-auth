
import adapter from '@sveltejs/adapter-netlify';

const config = {
	kit: {
		// default options are shown
		adapter: adapter({
			// if true, will create a Netlify Edge Function rather
			// than using standard Node-based functions
			edge: false,

			// if true, will split your app into multiple functions
			// instead of creating a single one for the entire app.
			// if `edge` is true, this option cannot be used
			split: false
		}),
		csp: {
			directives: {
				'script-src': ['self']
			}
		}
	}
};

export default config;



