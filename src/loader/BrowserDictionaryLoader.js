/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

var DictionaryLoader = require("./DictionaryLoader");

if (!self.kuromoji) {
    self.kuromoji = {
        cached_dics: []
    };
}

/**
 * BrowserDictionaryLoader inherits DictionaryLoader, using jQuery XHR for download
 * @param {string} dic_path Dictionary path
 * @constructor
 */
function BrowserDictionaryLoader(dic_path) {
    DictionaryLoader.apply(this, [dic_path]);
}

BrowserDictionaryLoader.prototype = Object.create(DictionaryLoader.prototype);

/**
 * Utility function to load dictionary
 * @param {string} url Dictionary URL
 * @param {BrowserDictionaryLoader~onLoad} callback Callback function
 */
BrowserDictionaryLoader.prototype.loadArrayBuffer = function (url, callback) {
    var cached_dic = self.kuromoji.cached_dics.find(function (cached_dic) {
        return cached_dic.url === url;
    });

    if (!cached_dic) {
        cached_dic = {
            fetch: fetch(url).then(function (response) {
                return new Promise(function (resolve, reject) {
                    if (!response.ok) {
                        reject(response.statusText);
                    }

                    response.arrayBuffer().then(function (arraybuffer) {
                        resolve(arraybuffer);
                    });
                });
            }),
            url
        };

        self.kuromoji.cached_dics.push(cached_dic);
    }

    cached_dic.fetch.then(function (arraybuffer) {
        callback(null, arraybuffer);
    }).catch(function (exception) {
        callback(exception, null);
    });
};

/**
 * Callback
 * @callback BrowserDictionaryLoader~onLoad
 * @param {Object} err Error object
 * @param {Uint8Array} buffer Loaded buffer
 */

module.exports = BrowserDictionaryLoader;
