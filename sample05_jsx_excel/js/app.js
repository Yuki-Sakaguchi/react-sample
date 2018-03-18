/**
 * EXCELを作る
 */

var headers = [
  'タイトル',
  '著者',
  '言語',
  '出版年',
  '売り上げ部数',
];

var data = [
  [
    'The Load of the Rings',
    'J. R. R. Tolkien',
    'English',
    '1954-1955',
    '150 million',
  ],
  [
    'Le Petit Prince (The Little Prince)',
    'Antonine de Saint-Exupery',
    'French',
    '1943',
    '140 million',
  ],
  [
    'Harry Potter and the Philosopher\'s Stone',
    'J. K. Rowling',
    'English',
    '1997',
    '107 million',
  ],
  [
    'And Then There Were None',
    'Agatha Christie',
    'English',
    '1939',
    '100 million',
  ],
  [
    'Dream of the Red Chamber',
    'Cao Xueqin',
    'chinese',
    '1937',
    '100 million',
  ],
  [
    'The Hobbit',
    'J. R. R. Tolkien',
    'English',
    '1937',
    '100 million',
  ],
  [
    'She: A History of Adventure',
    'H. Rider Haggard',
    'English',
    '1887',
    '100 million',
  ],
];


// EXCELコンポーネントを定義
var Excel = React.createClass({
  // コンポーネント名
  displayName: 'Excel',

  // propsの設定
  propTypes: {
    headers: React.PropTypes.arrayOf(
      React.PropTypes.string
    ),
    initialData: React.PropTypes.arrayOf(
      React.PropTypes.arrayOf(
        React.PropTypes.string
      )
    )
  },

  // ログ
  _log: [],

  // 検索時の元データ
  _preSearchData: null,

  // ステートの初期化
  getInitialState: function() {
    return {
      data: this.props.initialData, // データ自体
      sortby: null, // ソートの基準となるアイテム
      descending: false, // 昇順か降順か
      edit: null, // {row: 行, cell: 列}
      search: false, // 検索機能
    }
  },

  // キー入力イベントを追加
  componentDidMount: function() {
    document.onkeydown = function(e) {
      // alt + shift + r
      if (e.altKey && e.shiftKey && e.keyCode === 82) {
        this._replay();
      }
    }.bind(this);
  },

  // やり直し
  _replay: function() {
    if (this._log.length === 0) {
      console.warn('ステートが記録されてません。');
      return;
    }
    var idx = -1;
    var interval = setInterval(function() {
      idx++;
      if (idx === this._log.length - 1) {
        clearInterval(interval);
      }
      this.setState(this._log[idx]);
    }.bind(this), 1000);
  },

  // ソート処理
  _sort: function(e) {
    var column = e.target.cellIndex; // ターゲットを取得
    var tmpData = this.state.data.slice(); // データのコピーを作成
    var tmpDescending = this.state.sortby === column && !this.state.descending; // ソートの方向

    // 昇順に並び替え
    tmpData.sort(function(a, b) {
      return tmpDescending
        ? (a[column] > b[column] ? 1 : -1)
        : (a[column] < b[column] ? 1 : -1);
    });

    // ステートを更新
    this._logSetState({
      data: tmpData,
      sortby: column,
      descending: tmpDescending,
    });
  },

  // エディターを表示 
  _showEditor: function(e) {
    this._logSetState({
      edit: {
        row: parseInt(e.target.dataset.row, 10),
        cell: e.target.cellIndex,
      }
    });
  },

  // セーブ
  _save: function(e) {
    e.preventDefault();
     var input = e.target.firstChild;
     var tmpData = this.state.data.slice();
     tmpData[this.state.edit.row][this.state.edit.cell] = input.value;
     this._logSetState({
       edit: null,
       data: tmpData
     })
  },

  // 検索モードの切り替え
  _toggleSearch: function() {
    if (this.state.search) {
      this._logSetState({
        data: this._preSearchData,
        search: false,
      });
      this._preSearchData = null;
    } else {
      this._preSearchData = this.state.data;
      this._logSetState({
        search: true,
      });
    }
  },

  // 検索
  _search: function(e) {
    var needle = e.target.value.toLowerCase();
    if (!needle) {
      this._logSetState({
        data: this._preSearchData
      });
      return;
    }
    var idx = e.target.dataset.idx;
    var searchdata = this._preSearchData.filter(function(row) {
      return row[idx].toString().toLowerCase().indexOf(needle) > -1;
    });
    this._logSetState({
      data: searchdata
    });
  },

  // セットするステートを記録
  _logSetState: function(newState) {
    this._log.push(JSON.parse(JSON.stringify(
      this._log.length === 0 ? this.state : newState
    )));
    this.setState(newState);
  },

  // ダウンロード
  _download: function(format, ev) {
    var contents = format === 'json' ? JSON.stringify(this.state.data) : this.state.data.reduce(function(result, row) {
      return result
       + row.reduce(function(rowresult, cell, idx) {
        return rowresult
          + '"'
          + cell.replace(/"/g, '\\"')
          + '"'
          + (idx < row.length - 1 ? ',' : '');
       }, '')
       + "\n"; 
    }, '');

    var URL = window.URL || window.webkitURL;
    var blob = new Blob([contents], {
      type: 'text/' + format
    });
    ev.target.href = URL.createObjectURL(blob);
    ev.target.download = 'data.' + format;
  },

  // ツールバーの描画
  _renderToolbar: function() {
    return (
      <div className="toolbar">
        <button onClick={this._toggleSearch}>検索</button>
        <a href="data.json" onClick={this._download.bind(this, 'json')}>JSONで保存</a>
        <a href="data.csv" onClick={this._download.bind(this, 'csv')}>CSVで保存</a>
      </div>
    );
  },

  // 検索
  _renderSearch: function() {
    if (!this.state.search) {
      return null;
    }
    return (
      <tr onChange={this._search}>
        {this.props.headers.map(function(_ignore, idx) {
          return (
            <td key={idx}>
              <input type="text" data-idx={idx} />
            </td>
          );
        })}
      </tr>
    );
  },

  // テーブルの描画
  _renderTable: function() {
    return (
      <table>
        <thead onClick={this._sort}>
          <tr>
            {this.props.headers.map(function(title, idx) {
              if (this.state.sortby === idx) {
                title += this.state.descending ? ' \u2191' : ' \u2193';
              }
              return (
                <th key={idx}>{title}</th>
              );
            }, this)}
          </tr>
        </thead>
        <tbody onDoubleClick={this._showEditor}>
          {this._renderSearch()}
          {this.state.data.map(function(row, rowidx) {
            return (
              <tr key={rowidx}>
                {row.map(function(cell, idx) {
                  var content = cell;
                  var tmpEdit = this.state.edit;

                  return (
                    <td key={idx} data-row={rowidx}>
                      {(function() {
                        if (tmpEdit && tmpEdit.row === rowidx && tmpEdit.cell === idx) {
                          return (
                            <form onSubmit={this._save}>
                              <input type="text" defaultValue={content} />
                            </form>
                          );
                        } else {
                          return content;
                        }
                      }.bind(this))()}
                    </td>
                  );
                }, this)}
              </tr>
            );
          }, this)}
        </tbody>
      </table>
    );
  },

  // 描画
  render: function() {
    return (
      <div className="excel">
        {this._renderToolbar()}
        {this._renderTable()}
      </div>
    );
  },
});

// コンポーネント呼び出し
ReactDOM.render(
  <Excel headers={headers} initialData={data} />,
  document.getElementById('app')
);