var request = require('request');

import {config} from './../config/config';

const ranktrackr_make_call = ({method, api_endpoint, form}) => {
  return new Promise((resolve, reject) => {
    request[method](
      `${config.ranktrackr.api_url}${api_endpoint}`,
      {
        form,
      },
      function (error, response, body) {
        if (error) {
          reject(error);
        } else {
          let parsed_json = JSON.parse(body);
          resolve(parsed_json);
        }
      }
    );
  });
};

const ranktrackr_get_access_token = () => {

  return new Promise((resolve, reject) => {

    ranktrackr_make_call(
      {
        method: 'post',
        api_endpoint: '/token',
        form: {
          email: config.ranktrackr.email,
          password: config.ranktrackr.password,
        }
      }
    )
      .then(response => {
        resolve(response.access_token);
      })
    ;
  });

};

const ranktrackr_get_groups = () => {

  return new Promise((resolve, reject) => {
    ranktrackr_get_access_token()
      .then(access_token => {
        ranktrackr_make_call(
          {
            method: 'get',
            api_endpoint: '/url_groups',
            form: {
              access_token
            }
          }
        )
          .then(groups => {
            let results = [];
            Object.keys(groups).forEach(group => results.push({id: groups[group].id, name: groups[group].name}));
            resolve(results);
          })
        ;
      });
  });
};

const ranktrackr_add_group = ({name}) => {

  return new Promise((resolve, reject) => {
    ranktrackr_get_access_token()
      .then(access_token => {
        ranktrackr_make_call(
          {
            method: 'post',
            api_endpoint: '/url_groups',
            form: {
              access_token,
              url_group: {
                name,
              }
            }

          }
        )
          .then(response => {
            if (response.id && response.name) {
              resolve({id: response.id, name: response.name});
            } else {
              reject(response);
            }
          })
        ;
      });
  });
};


const ranktrackr_delete_group = ({group_id}) => {
  return new Promise((resolve, reject) => {
    ranktrackr_get_access_token()
      .then(access_token => {
        ranktrackr_make_call(
          {
            method: 'delete',
            api_endpoint: `/url_groups/${group_id}`,
            form: {
              access_token,
            }
          }
        )
          .then(response => {
            if (response.error) {
              reject(response);
            } else {
              resolve(response);
            }
          });
      });
  });
};

const ranktrackr_get_urls = () => {
  return new Promise((resolve, reject) => {
    ranktrackr_get_access_token()
      .then(access_token => {
        ranktrackr_make_call(
          {
            method: 'get',
            api_endpoint: '/urls',
            form: {
              access_token
            }
          }
        )
          .then(urls => {
            let results = [];
            Object.keys(urls).forEach(url => results.push({id: urls[url].id, url: urls[url].url}));
            resolve(results);
          })
        ;
      });
  });
};

const ranktrackr_add_urls = ({urls, group_id, url_type}) => {
  url_type = url_type || 'google';
  return new Promise((resolve, reject) => {
    ranktrackr_get_access_token()
      .then(access_token => {
        ranktrackr_make_call(
          {
            method: 'post',
            api_endpoint: '/urls/batch_create',
            form: {
              urls,
              group_id,
              url_type,
              access_token
            }
          }
        )
          .then(response => {
            resolve(response);
          })
        ;
      });
  });
};

const ranktrackr_delete_url = ({url_id}) => {
  return new Promise((resolve, reject) => {
    ranktrackr_get_access_token()
      .then(access_token => {
        ranktrackr_make_call(
          {
            method: 'delete',
            api_endpoint: `/urls/${url_id}`,
            form: {
              access_token
            }
          }
        )
          .then(response => {
            resolve(response);
          })
        ;
      });
  });
};

const ranktrackr_get_keywords = ({url_id}) => {
  return new Promise((resolve, reject) => {
    ranktrackr_get_access_token()
      .then(access_token => {
        ranktrackr_make_call(
          {
            method: 'get',
            api_endpoint: `/urls/${url_id}/keywords`,
            form: {
              access_token
            }
          }
        )
          .then(keywords => {
            let results = [];
            Object.keys(keywords).forEach(keyword => {

              // keywords[keyword] e.g. =
              //
              // {
              //   id: 874782,
              //   last_processed_at: '2016-07-04T13:20:48.748+02:00',
              //   query: 'wedding loans canada',
              //   created_at: '2016-03-04T20:34:46.936+01:00',
              //   position: 10,
              //   search_keyword_url_id: 36313,
              //   mobile: false,
              //   competitor_results: {},
              //   local_search: null,
              //   google_hl: 'en',
              //   google_gl: 'ca',
              //   last_day_change: -1,
              //   last_week_change: 1,
              //   last_month_change: -2,
              //   uri: '/celebrate-life-event/',
              //   result_url: 'https://lendingarch.ca/celebrate-life-event/',
              //   last_position_change: [-1, '2016-07-04T13:20:47.232+02:00', true],
              //   mini_graph: '/keyword_graphs/874782.png?u=1467631248',
              //   mini_graph_cache: '/system/keyword_evolution/874/874782/1467631248.png?u=1467631248',
              //   results_count: 914000,
              //   errors: {},
              //   owner_name: 'brenda',
              //   adwords_local_search_volume: 40,
              //   adwords_local_average_cpc: 6.41,
              //   adwords_global_search_volume: 50,
              //   adwords_global_average_cpc: 6.41,
              //   position_type: 'organic',
              //   position_organic: 10,
              //   position_places: null,
              //   position_places_image: null,
              //   position_local_pack: null,
              //   position_info: {},
              //   tags: [],
              //   engine: 'google',
              //   url: 'http://lendingarch.ca',
              //   previous_position: 9,
              //   best_position: 5,
              //   position_changed_during_last_day: -1,
              //   position_changed_during_last_week: 1,
              //   position_changed_during_last_month: -2
              // }

              results.push(
                {
                  id: keywords[keyword].id,
                  keyword: keywords[keyword].query,
                  uri: keywords[keyword].uri,
                  url: keywords[keyword].result_url,
                  global_search_volume: keywords[keyword].adwords_global_search_volume,
                  mini_graph_uri: keywords[keyword].mini_graph,
                }
              );
            });
            resolve(results);
          })
        ;
      });
  });
};

const ranktrackr_get_urls_with_keywords = () => {
  return new Promise((resolve, reject) => {
    let result = [];
    ranktrackr_get_urls()
      .then(urls => {
        let promises = [];
        Object.keys(urls).forEach(url_index => {
          let url = urls[url_index]; // e.g. { id: 18120, url: 'http://www.calgarycleaning.com' }
          let promise = ranktrackr_get_keywords({url_id: url.id})
            .then(keywords => {
              result.push(keywords);
            });
          promises.push(promise);
        });
        Promise.all(promises)
          .then(() => {
            resolve(result);
          });
      });
  });
};

const ranktrackr_add_keywords = ({url_id, keywords, google_hl, google_gl}) => {

  google_hl = google_hl || 'en'; // human language
  google_gl = google_gl || 'ca'; // google's country


  return new Promise((resolve, reject) => {
    ranktrackr_get_access_token()
      .then(access_token => {
        ranktrackr_make_call(
          {
            method: 'post',
            api_endpoint: `/urls/${url_id}/keywords/batch_create`,
            form: {
              keywords,
              google_hl,
              google_gl,
              access_token,
            }
          }
        )
          .then(response => {
            resolve(response);
          })
        ;
      });
  });
};

const ranktrackr_move_url_to_group = ({url_id, group_id}) => {
  return new Promise((resolve, reject) => {
    ranktrackr_get_access_token()
      .then(access_token => {
        ranktrackr_make_call(
          {
            method: 'put',
            api_endpoint: `/urls/${url_id}`,
            form: {
              url: {
                url_group_id: group_id,
              },
              access_token,
            }
          }
        )
          .then(response => {
            resolve(response);
          })
        ;
      });
  });
};

export {
  ranktrackr_get_groups,
  ranktrackr_add_group,
  ranktrackr_delete_group,
  ranktrackr_get_urls,
  ranktrackr_add_urls,
  ranktrackr_delete_url,
  ranktrackr_get_keywords,
  ranktrackr_add_keywords,
  ranktrackr_move_url_to_group,
  ranktrackr_get_urls_with_keywords,
};
