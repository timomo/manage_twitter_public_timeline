<?php

use Illuminate\Support\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

use core\Models\CoreUser;

abstract class AbstractApiValidationControllerTest extends TestCase
{
    use DatabaseTransactions;

    /**
     * テストする時の正常系の値
     */
    protected $attributes = [];

    /**
     * CSVで読み取ったUnitの担当の設定
     */
    protected $config = [];

    /**
     * URLのPrefix
     */
    protected $urlPrefix = '/api/v1/';

    /**
     * CSVファイルの要素番号
     */
    protected $numberOfApi = 0;
    protected $numberOfKey = 2;
    protected $numberOfRequire = 3;
    protected $numberOfMax = 4;
    protected $numberOfMin = 5;

    /**
     * 何のメソッドに対してのテストかを定義
     */
    protected $actionController = '';
    protected $actionMethod = '';

    /**
     * PUTを行う際の対象id
     */
    protected $targetId = null;

    /**
     * assertをする際の除外対象
     */
    public static $unset_columns = [
        'updated_at',
        'updated_user_id',
    ];

    /**
     * メールアドレスのカラム
     *  (対象に入るとテストデータを使わずに元のデータを使用する)
     */
    protected $mails = [];

    /**
     * ＜半角英数＞
     */
    public static $string011 = [
        '!', '"', '#', '$', '%', '&', "'", '(', ')', '*', '+', '，', '-', '.', '/',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        ':', ';', '<', '=', '>', '?', '@',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
        'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
        '[', '\\', '］', '^', '_', '`',
    ];
    public static $string012 = [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
        'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'y', 'z',
        '{', '|', '}', '~', '｡', '[', ']', '､',
        'ｦ', 'ｧ', 'ｨ', 'ｩ', 'ｪ', 'ｫ', 'ｬ', 'ｭ', 'ｮ', 'ｯ', 'ｰ',
        'ｱ', 'ｲ', 'ｳ', 'ｴ', 'ｵ', 'ｶ', 'ｷ', 'ｸ', 'ｹ', 'ｺ', 'ｻ', 'ｼ', 'ｽ', 'ｾ', 'ｿ',
        'ﾀ', 'ﾁ', 'ﾂ', 'ﾃ', 'ﾄ', 'ﾅ', 'ﾆ', 'ﾇ', 'ﾈ', 'ﾉ', 'ﾊ', 'ﾋ', 'ﾌ', 'ﾍ', 'ﾎ',
        'ﾏ', 'ﾐ', 'ﾑ', 'ﾒ', 'ﾓ', 'ﾔ', 'ﾕ', 'ﾖ', 'ﾗ', 'ﾘ', 'ﾙ', 'ﾚ', 'ﾛ', 'ﾜ', 'ﾝ',
        'ﾞ', 'ﾟ',
    ];

    /**
     * ＜記号＞
     */
    public static $string021 = [
        '　', '、', '。', '，', '･', ':', ';', '?', '!', '゛', '゜', '´', '｀',
        '¨', '^', '＼', '/', '-', '―', 'ー', '〇', '〆', '々', '仝', '〃', 'ゞ',
        'ゝ', 'ヾ', 'ヽ', '_', '￣', '~', '∥', '|', '…', '‥', '・', '`', '\'',
        '"', '"', '(', ')', '〔', '〕', '[', ']', '{', '}', '<', '>', '《', '》',
        '[', ']', '『', '』', '【', '】', '+', '-', '±', '×', '÷', '=', '≠',
        '<', '>', '≦', '≧',
    ];
    public static $string022 = [
        '∞', '∴', '♂', '♀', '°', '\'', '"', '℃', '\\',
        '$', '￠', '￡', '%', '#', '&', '*', '@', '§', '☆', '★', '○', '●', '◎',
        '◇', '◆', '□', '■', '△', '▲', '▽', '▼', '※', '〒', '→', '←', '↑',
        '↓', '〓', '∈', '∋', '⊆', '⊇', '⊂', '⊃', '∪', '∩',
    ];
    public static $string023 = [
        '∧', '∨', '￢',
        '⇒', '⇔', '∀', '∃', '∠', '⊥', '⌒', '∂', '∇', '≡', '≒', '≪', '≫',
        '√', '∽', '∝', '∵', '∫', '∬', 'Å', '‰', '♯', '♭', '♪', '†', '‡',
        '¶', '◯', '～',
    ];

    /**
     * ＜英数字＞
     */
    public static $string031 = [
        '０', '１', '２', '３', '４', '５', '６', '７', '８', '９',
        'Ａ', 'Ｂ', 'Ｃ', 'Ｄ', 'Ｅ', 'Ｆ', 'Ｇ', 'Ｈ', 'Ｉ', 'Ｊ', 'Ｋ', 'Ｌ', 'Ｍ',
        'Ｎ', 'Ｏ', 'Ｐ', 'Ｑ', 'Ｒ', 'Ｓ', 'Ｔ', 'Ｖ', 'Ｗ', 'Ｘ', 'Ｙ', 'Ｚ',
        'ａ', 'ｂ', 'ｃ', 'ｄ', 'ｅ', 'ｆ', 'ｇ', 'ｈ', 'ｉ', 'ｊ', 'ｋ', 'ｌ', 'ｍ',
        'ｎ', 'ｏ', 'ｐ', 'ｑ', 'ｒ', 'ｓ', 'ｔ', 'ｕ', 'ｖ', 'ｗ', 'ｘ', 'ｙ', 'ｚ',
    ];

    /**
     * ＜ひらがな＞
     */
    public static $string041 = [
        'ぁ', 'あ', 'ぃ', 'い', 'ぅ', 'う', 'ぇ', 'え', 'ぉ', 'お',
        'か', 'が', 'き', 'ぎ', 'く', 'ぐ', 'け', 'げ', 'こ', 'ご',
        'さ', 'ざ', 'し', 'じ', 'す', 'ず', 'せ', 'ぜ', 'そ', 'ぞ',
        'た', 'だ', 'ち', 'ぢ', 'っ', 'つ', 'づ', 'て', 'で', 'と', 'ど',
        'な', 'に', 'ぬ', 'ね', 'の',
    ];
    public static $string042 = [
        'は', 'ば', 'ぱ', 'ひ', 'び', 'ぴ', 'ふ', 'ぶ', 'ぷ', 'へ', 'べ', 'ぺ', 'ほ', 'ぼ', 'ぽ',
        'ま', 'み', 'む', 'め', 'も',
        'ゃ', 'や', 'ゅ', 'ゆ', 'ょ', 'よ',
        'ら', 'り', 'る', 'れ', 'ろ',
        'ゎ', 'わ', 'ゐ', 'ゑ', 'を', 'ん',
    ];

    /**
     * ＜カタカナ＞
     */
    public static $string051 = [
        'ァ', 'ア', 'ィ', 'イ', 'ゥ', 'ウ', 'ェ', 'エ', 'ォ', 'オ',
        'カ', 'ガ', 'キ', 'ギ', 'ク', 'グ', 'ケ', 'ゲ', 'コ', 'ゴ',
        'サ', 'ザ', 'シ', 'ジ', 'ス', 'ズ', 'セ', 'ゼ', 'ソ', 'ゾ',
        'タ', 'ダ', 'チ', 'ヂ', 'ッ', 'ツ', 'ヅ', 'テ', 'ト', 'ド',
        'ナ', 'ニ', 'ヌ', 'ネ', 'ノ',
    ];
    public static $string052 = [
        'ハ', 'バ', 'パ', 'ヒ', 'ビ', 'ピ', 'フ', 'ブ', 'プ', 'ヘ', 'ベ', 'ペ', 'ホ', 'ボ', 'ポ',
        'マ', 'ミ', 'ム', 'メ', 'モ',
        'ャ', 'ヤ', 'ュ', 'ユ', 'ョ', 'ヨ',
        'ラ', 'リ', 'ル', 'レ', 'ロ',
        'ヮ', 'ワ', 'ヰ', 'ヱ', 'ヲ', 'ン',
        'ヴ', 'ヵ', 'ヶ',
    ];

    /**
     * ＜ギリシャ・ロシア文字＞
     */
    public static $string061 = [
        'Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ', 'Λ', 'Μ',
        'Ν', 'Ξ', 'Ο', 'Π', 'Ρ', 'Σ', 'Τ', 'Υ', 'Φ', 'Χ', 'Ψ', 'Ω',
        'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ',
        'ν', 'ξ', 'ο', 'π', 'ρ',
    ];
    public static $string062 = [
        'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω', 'А', 'Б', 'В', 'Г', 'Д',
        'Е', 'Ё', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П',
        'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы',
        'Ь', 'Э', 'Ю', 'Я',
    ];
    public static $string063 = [
        'а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'и', 'й', 'к', 'л',
        'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч',
        'ш', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю', 'я',
    ];

    /**
     * ＜罫線素片／囲み英数字／アラビア数字／単位記号＞
     */
    public static $string071 = [
        '─', '│', '┌', '┐', '┘', '└', '├', '┬', '┤', '┴', '┼', '━',
        '┃', '┏', '┓', '┛', '┗', '┣', '┳', '┫', '┻', '╋', '┠', '┯',
        '┨', '┷', '┿', '┝', '┰', '┥', '┸', '╂',
    ];
    public static $string072 = [
        '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩',
        '⑪', '⑫', '⑬', '⑭', '⑮', '⑯', '⑰', '⑱', '⑲', '⑳',
        'Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ', 'Ⅷ', 'Ⅸ', 'Ⅹ',
    ];
    public static $string073 = [
        '㍉', '㌔', '㌢', '㍍', '㌘', '㌧', '㌃', '㌶', '㍑', '㍗',
        '㌍', '㌣', '㌫', '㌫', '㍊', '㌻', '㎜', '㎝', '㎞', '㎎',
        '㎏', '㏄', '㎡',
    ];

    /**
     * ＜省略文字／囲み文字／年号／数学記号＞
     */
    public static $string081 = [
        '㍻', '№', '㏍', '℡', '㊤', '㊥', '㊦', '㊧', '㊨', '㈱',
        '㈲', '㈹', '㍾', '㍽', '㍼', '≒', '≡', '∫', '∮', '∑',
        '√', '⊥', '∠', '∟', '⊿', '∵', '∩', '∪',
    ];

    /**
     * ＜漢字1（一部抜粋）＞
     */
    public static $string091 = [
        '亜', '唖', '娃', '阿', '哀', '愛', '挨', '姶', '逢', '葵',
        '茜', '穐', '悪', '握', '渥', '旭', '葦', '芦', '鯵', '梓',
        '圧', '斡', '扱', '宛', '姐', '虻', '飴', '絢', '綾', '鮎',
        '或', '粟', '袷', '安', '庵', '按', '暗', '案', '闇', '鞍',
        '杏',
    ];
    public static $string092 = [
        '以', '伊', '位', '依', '偉', '囲', '夷', '委', '威', '尉',
        '惟', '意', '慰', '易', '椅', '為', '畏', '異', '移', '維',
        '緯', '胃', '萎', '衣', '謂', '違', '遺', '医', '井', '亥',
        '域', '育', '郁', '磯', '一', '壱', '溢', '逸', '稲', '茨',
        '芋',
    ];
    public static $string093 = [
        '鰯', '允', '印', '咽', '員', '因', '姻', '引', '飲', '淫',
        '胤', '蔭',
    ];

    /**
     * ＜漢字2（一部抜粋）＞
     */
    public static $string101 = [
        '弌', '丐', '丕', '个', '丱', '丶', '丼', '丿', '乂', '乖',
        '乘', '亂', '豫', '亊', '舒', '弍', '于', '亞', '亟', '亠',
        '亢', '亰', '亳', '亶', '从', '仍', '仄', '仆', '仂', '仗',
        '仞', '仭', '仟', '价', '伉', '佚', '估', '佛', '佝', '佗',
        '佇',
    ];
    public static $string102 = [
        '佶', '侈', '侏', '侘', '佻', '佩', '佰', '侑', '佯', '來',
        '侖', '儘', '俔', '俟', '俎', '俘', '俛', '俑', '俚', '俐',
        '俤', '俥', '倚', '倨', '倔', '倪', '倥', '倅', '伜', '俶',
        '倡', '倩', '倬', '俾', '俯', '們', '倆', '偃', '假', '會',
        '偕',
    ];
    public static $string103 = [
        '偐', '偈', '做', '偖', '偬', '偸', '傀', '傚', '傅', '傴',
        '傲',
    ];

    /**
     * ＜HTML禁則文字＞
     */
    public static $string111 = [
        // <a>&'test'</a> ⇒ &quot;&lt;a&gt;&amp;'test'&lt;/a&gt;&quot;
    ];

    /**
     * ＜チャッコメン禁則文字＞
     */
    public static $string121 = [
        '#', '\'', ',', ':', ';', '@', '\\', '~', '￣', '―', '＼',
        '～', '∥', '…', '－', '￥', '￠', '￡', '￢',
    ];

    public function setUp()
    {
        parent::setUp();
        Model::unguard();
        $user = new CoreUser(['id' => 1, 'account' => 'administrator@kccs.co.jp', 'lang' => 'ja']);
        $this->be($user);
        Model::unguard(false);
        $this->config = $this->returnCsv();
        $this->setMethod();
    }

    protected function setMethod()
    {
        // ApiCoreMenuGroupController@getCoreGroups
        $klass = class_basename(get_class($this));
        $methods = [
            '[iI]ndex',
            '[sS]tore',
            '[sS]how',
            '[uU]pdate',
            '[dD]estroy',
            '[gG]et',
            '[pP]ost',
            '[pP]ut',
            '[dD]elete',
        ];
        $regex = implode('|', $methods);
        if (preg_match('/(.*)('. $regex. ')(.*)Test/', $klass, $matches) !== 0) {
            if ($this->actionMethod === '') {
                $this->actionMethod = lcfirst($matches[2]). $matches[3];
            }
            if ($this->actionController !== '') {
                return true;
            }
            $this->actionController = $matches[1];
            if (strpos($this->actionController, 'Api') === false) {
                $this->actionController = 'Api'. $this->actionController;
            }
            if (strpos($this->actionController, 'Controller') === false) {
                $this->actionController = $this->actionController. 'Controller';
            }
        }
    }

    protected function getUnitName()
    {
        $klass = class_basename($this);
        $klass = preg_replace('/Controller.+Test$/', '', $klass);
        $klass = preg_replace('/^Core/', '', $klass);
        return strtolower($klass);
    }

    // CSVから対象だけ抜き出して返す
    protected function returnCsv()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $unitName = $this->getUnitName();
        $handle = fopen(__DIR__. '/../public/unit_test_pettern_list.csv', 'r');
        $ret = [];

        if ($handle === false) {
            die("test");
        }
        while(($data = fgetcsv($handle, 1000, ',')) !== false) {
            if ($data[0] !== $unitName) {
                continue;
            }
            $ret[] = $data;
        }
        return $ret;
    }

    /**
     * 想定データ送信
     * @group basic
     * @group character_type
     * @test
     */
    public function t001()
    {
        $this->post($this->urlPrefix. $this->getUnitName(), $this->attributes);
        $expect = $this->getExcludedArray($this->attributes, static::$unset_columns);
        $this->seeJson($expect);
        $this->seeStatusCode(200);
    }

    /**
     * 必須項目を削除して送信
     * @group basic
     * @group character_type
     * @test
     */
    public function t003()
    {
        $columns = [];
        foreach ($this->config as $data) {
            if ($data[$this->numberOfRequire] != 1) {
                continue;
            }
            if ($this->checkColumnName($data) === false) {
                continue;
            }
            $columns[] = $data[$this->numberOfKey];
        }
        if ($this->checkTest($columns) === false) {
            $this->markTestSkipped(__FUNCTION__. 'をスキップします');
        }
        $inputs = [];
        foreach ($columns as $column) {
            unset($inputs[$column]);
        }
        $this->post($this->urlPrefix. $this->getUnitName(), $inputs);
        $expect = $this->getExcludedArray($inputs, static::$unset_columns);
        $this->seeJson();
        $this->seeOrionInvalidModelException($expect);
        $this->seeStatusCode(422);
    }

    /**
     * 必須項目を空で送信
     * @group basic
     * @group character_type
     * @test
     */
    public function t005()
    {
        $columns = [];
        foreach ($this->config as $data) {
            if ($data[$this->numberOfRequire] != 1) {
                continue;
            }
            if ($this->checkColumnName($data) === false) {
                continue;
            }
            $columns[] = $data[$this->numberOfKey];
        }
        if ($this->checkTest($columns) === false) {
            $this->markTestSkipped(__FUNCTION__. 'をスキップします');
        }
        $inputs = [];
        foreach ($columns as $column) {
            $inputs[$column] = null;
        }
        $this->post($this->urlPrefix. $this->getUnitName(), $inputs);
        $expect = $this->getExcludedArray($inputs, static::$unset_columns);
        $this->seeJson();
        $this->seeOrionInvalidModelException($expect);
        $this->seeStatusCode(422);
    }

    /**
     * 最大文字数n-1文字送信
     * @group basic
     * @group character_type
     * @test
     */
    public function t007()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $columns = [];

        foreach ($this->config as $data) {
            if (is_numeric($data[$this->numberOfMax]) === false) {
                continue;
            }
            if ($this->checkColumnName($data) === false) {
                continue;
            }
            $columns[$data[2]] = (int)$data[4];
        }
        if ($this->checkTest($columns) === false) {
            $this->markTestSkipped(__FUNCTION__. 'をスキップします');
        }
        $target = $this->attributes;
        // 文字列(最大長 - 1)のチェック
        $inputs = [];
        foreach ($target as $column => $value) {
            if (array_key_exists($column, $columns) === true) {
                $inputs[$column] = $this->strPad($column, $value, $columns[$column] - 1, $value);
            } else {
                $inputs[$column] = $value;
            }
        }
        $inputs = $this->getExcludedArray($inputs, static::$unset_columns);
        $this->post($this->urlPrefix. $this->getUnitName(), $inputs);
        $expect = $this->getExcludedArray($inputs, static::$unset_columns);
        $this->seeJson($expect);
        $this->seeStatusCode(200);
    }

    /**
     * 最大文字数n文字送信
     * @group basic
     * @group character_type
     * @test
     */
    public function t009()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $columns = [];

        foreach ($this->config as $data) {
            if (is_numeric($data[$this->numberOfMax]) === false) {
                continue;
            }
            if ($this->checkColumnName($data) === false) {
                continue;
            }
            $columns[$data[2]] = (int)$data[4];
        }
        if ($this->checkTest($columns) === false) {
            $this->markTestSkipped(__FUNCTION__. 'をスキップします');
        }

        // 対象取得
        $target = $this->attributes;

        // 文字列(最大長)のチェック
        $inputs = [];
        foreach ($target as $column => $value) {
            if (array_key_exists($column, $columns) === true) {
                $inputs[$column] = $this->strPad($column, $value, $columns[$column], $value);
            } else {
                $inputs[$column] = $value;
            }
        }
        $inputs = $this->getExcludedArray($inputs, static::$unset_columns);
        $this->post($this->urlPrefix. $this->getUnitName(), $inputs);
        $expect = $this->getExcludedArray($inputs, static::$unset_columns);
        $this->seeJson($expect);
        $this->seeStatusCode(200);
    }

    /**
     * 最大文字数n+1文字送信
     * @group basic
     * @group character_type
     * @test
     */
    public function t011()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $columns = [];

        foreach ($this->config as $data) {
            if (is_numeric($data[$this->numberOfMax]) === false) {
                continue;
            }
            if ($this->checkColumnName($data) === false) {
                continue;
            }
            $columns[$data[2]] = (int)$data[4];
        }
        if ($this->checkTest($columns) === false) {
            $this->markTestSkipped(__FUNCTION__. 'をスキップします');
        }

        // 対象取得
        $target = $this->attributes;

        // 文字列(最大長 + 1)のチェック
        $inputs = [];
        foreach ($target as $column => $value) {
            if (array_key_exists($column, $columns) === true) {
                $inputs[$column] = $this->strPad($column, $value, $columns[$column] + 1, $value);
            } else {
                $inputs[$column] = $value;
            }
        }
        $inputs = $this->getExcludedArray($inputs, static::$unset_columns);
        $this->post($this->urlPrefix. $this->getUnitName(), $inputs);
        $expect = $this->getExcludedArray($inputs, static::$unset_columns);
        $this->seeJson();
        $this->seeOrionInvalidModelException($expect);
        $this->seeStatusCode(422);
    }

    /**
     */
    public function checkOfTheMinimumNumberOfCharacters()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $columns = [];

        foreach ($this->config as $data) {
            if ($data[5] === '-' || trim($data[5]) === '') {
                continue;
            }
            if ($this->checkColumnName($data) === false) {
                continue;
            }
            $columns[$data[2]] = (int)$data[5];
        }
        if ($this->checkTest($columns) === false) {
            $this->markTestSkipped(__FUNCTION__. 'をスキップします');
        }

        $tmpUrl = $this->urlPrefix. $url. '/'. $this->targetId;
        $this->get($tmpUrl)
            ->seeStatusCode(200)
            ->seeJson(['id' => $this->targetId]);
        $target = json_decode($this->response->getContent(), true);

        // 文字列(最小 + 1)のチェック
        $inputs = [];
        foreach ($target as $column => $value) {
            if (in_array($column, static::$unset_columns)) {
                // noop
            } elseif (array_key_exists($column, $columns) === true) {
                $inputs[$column] = $this->strPad($column, $value, $columns[$column] + 1, $value);
            } else {
                $inputs[$column] = $value;
            }
        }
        $tmpUrl = $this->urlPrefix. $url. '/'. $this->targetId;
        $this->put($tmpUrl, $inputs)
            ->seeStatusCode(200)
            ->seeJson($inputs);
        // 文字列(最小長)のチェック
        $inputs = [];
        foreach ($target as $column => $value) {
            if (in_array($column, static::$unset_columns)) {
                // noop
            } elseif (array_key_exists($column, $columns) === true) {
                $inputs[$column] = $this->strPad($column, $value, $columns[$column], $value);
            } else {
                $inputs[$column] = $value;
            }
        }
        $tmpUrl = $this->urlPrefix. $url. '/'. $this->targetId;
        $this->put($tmpUrl, $inputs)
            ->seeStatusCode(200)
            ->seeJson($inputs);

        // 文字列(最小長 - 1)のチェック
        $inputs = [];
        $expect = [];
        foreach ($target as $column => $value) {
            if (in_array($column, static::$unset_columns)) {
                // noop
            } elseif (array_key_exists($column, $columns) === true) {
                $inputs[$column] = $this->strPad($column, $value, $columns[$column] - 1, $value);
                if ($value !== $inputs[$column]) {
                    $expect[] = $column;
                }
            } else {
                $inputs[$column] = $value;
            }
        }
        $tmpUrl = $this->urlPrefix. $url. '/'. $this->targetId;
        $this->put($tmpUrl, $inputs)
            ->seeStatusCode(422)
            ->seeJson()
            ->seeOrionInvalidModelException($expect);
    }

    public function replaceMail($column, $address, $padLength)
    {
        return $address;
        // return $this->attributes[$column];
        if ($padLength <= 64) {
            $str = str_pad('', $padLength, 'a');
            $str = mb_substr($str, $padLength * -1, null, 'UTF-8');
            $str = preg_replace('/^../', 'a@', $str);
            $str = preg_replace('/....$/', '.com', $str);
            return $str;
        } else {
            $local = str_pad('', 64, 'a');
            $domain = str_pad('', $padLength - 65, 'a');
            $domain = preg_replace('/....$/', '.com', $domain);
            $str = $local. '@'. $domain;
            return $str;
        }
    }

    /**
     * テストをするかどうか判定
     */
    public function checkTest($data)
    {
        if (count($data) === 0) {
            return false;
        }
        return true;
    }

    /**
     * カラム名が取得出来るか判定
     */
    public function checkColumnName($data)
    {
        $no = $this->numberOfKey;
        if ($data[$no] === '-' || trim($data[$no]) === '') {
            return false;
        }
        return true;
    }

    /**
     * 除外条件を除いた配列を返す
     */
    public function getExcludedArray($a, $excludes = null)
    {
        if (is_null($excludes) === true) {
            $excludes = static::$unset_columns;
        }
        foreach ($excludes as $column) {
            unset($a[$column]);
        }
        return $a;
    }

    /**
     * ORIONのInvalidModelExceptionで
     * かえってきたエラーのチェック
     */
    public function seeOrionInvalidModelException($expect)
    {
        $content = json_decode($this->response->getContent(), true);
        $actual = array_keys($content);
        if ($this->isVector($expect) === false) {
            $expect = array_keys($expect);
        }
        $this->assertSame(Arr::sortRecursive($expect), Arr::sortRecursive($actual));
        return $this;
    }

    public function strPad($column, $input, $padLength, $padString)
    {
        $len = mb_strlen($padString);
        if ($len === 0) {
            $cnt = 0;
        } else {
            $cnt = (int)($padLength / $len);
        }
        $str = $input. str_repeat($input, $cnt + 1);
        if (in_array($column, $this->mails) === true) {
            return $this->replaceMail($column, $input, $padLength);
        }
        return mb_substr($str, 0, $padLength, 'UTF-8');
        return mb_strcut($str, 0, $padLength, 'UTF-8');
    }

    protected function getHttpMethod($actionMethod)
    {
        if (strpos($actionMethod, 'index') !== false) return 'GET';
        if (strpos($actionMethod, 'get') !== false) return 'GET';
        if (strpos($actionMethod, 'show') !== false) return 'GET';

        if (strpos($actionMethod, 'store') !== false) return 'POST';
        if (strpos($actionMethod, 'post') !== false) return 'POST';

        if (strpos($actionMethod, 'update') !== false) return 'PUT';
        if (strpos($actionMethod, 'put') !== false) return 'PUT';

        if (strpos($actionMethod, 'destroy') !== false) return 'DELETE';
        if (strpos($actionMethod, 'delete') !== false) return 'DELETE';

        return 'GET';
    }

    public function actionOrion(array $params = [])
    {
        $method = strtolower($this->getHttpMethod($this->actionMethod));
        $action = $this->actionController. '@'. $this->actionMethod;

        $uri = $this->urlPrefix. $this->getUnitName();

        if (strpos($this->actionMethod, 'index') !== false) {
            $uri .= '/'. $params['id'];
        }

        $this->$method($this->urlPrefix. $this->getUnitName());
        // $this->action($method, $action, $params);

        return $this;
    }

    public function isVector(array $array)
    {
        return array_values($array) === $array;
    }

    protected function assertContentRecord($response, $expected)
    {
        list($url, $seeder, $model) = $this->getKlass();
        $this->assertEquals(200, $response->getStatusCode());

        $content = json_decode($response->getContent(), true);

        $c = array_map(array($this, 'getUnsetColumnsArray'), array($content));
        $e = array_map(array($this, 'getUnsetColumnsArray'), array($expected));

        if (is_array($c) === true) {
            foreach ($c as &$row) {
                ksort($row);
            }
        }
        if (is_array($e) === true) {
            foreach ($e as &$row) {
                ksort($row);
            }
        }

        $this->assertSame($c, $e);
    }

    protected function assertContentList($expected)
    {
        list($url, $seeder, $model) = $this->getKlass();
        $response = $this->call('GET', '/api/v1/'. $url);
        $this->assertEquals(200, $response->getStatusCode());

        $content = json_decode($response->getContent(), true);

        $c = array_map(array($this, 'getUnsetColumnsArray'), $content);
        $e = array_map(array($this, 'getUnsetColumnsArray'), $expected);

        if (is_array($c) === true) {
            foreach ($c as &$row) {
                ksort($row);
            }
        }
        if (is_array($e) === true) {
            foreach ($e as &$row) {
                ksort($row);
            }
        }

        $this->assertSame($c, $e);
    }

    protected function assertForbidden()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $response = $this->call('GET', '/api/v1/'. $url);
        $this->assertEquals(403, $response->getStatusCode());
    }

    protected function getSortedByKey($a)
    {
        list($url, $seeder, $model) = $this->getKlass();
        $model = new $model();
        $key = $model->getKeyName();
        // @see http://stackoverflow.com/questions/1597736/
        $keys = array();
        foreach($a as $k => $v) {
            $keys[$k] = $v[$key];
        }
        array_multisort($keys, SORT_ASC, $a);
        return $a;
    }

    protected function getUnsetColumnsArray($a)
    {
        $a = (array)$a;
        $columns = static::$unset_columns;
        foreach ($columns as $column)
        {
            unset($a[$column]);
        }
        return $a;
    }

    protected function getKlass()
    {
        $klass = class_basename(get_class($this));
        $klass = preg_replace('/^Api/', '', $klass);
        $klass = preg_replace('/ControllerTest$/', '', $klass);

        $name = get_class($this);
        if ($name === class_basename($name)) {
            $seeder = $klass. "TableSeeder";
            $model = "core\\Models\\". $klass;
            $url = snake_case($klass);
            $url = preg_replace('/^core_/', '', $url);
        } else {
            $seeder = "PfTec". $klass. "TableSeeder";
            $basename = class_basename($name);
            $name = preg_replace('/'. $basename. '$/', '', $name);
            $model =  "{$name}Models\\{$klass}";
            $arr = explode("\\", $name);
            $package = snake_case($arr[1]);
            $package = str_replace("_", "-", $package);
            //$url = $package. "_". snake_case($klass);
            $url = snake_case($klass);
        }

        return array($url, $seeder, $model);
    }

    protected function getAction($action, $wildcards = [])
    {
        return $this->app['url']->action($action, $wildcards, true);
    }

    public function getTarget()
    {
        return [
        ];
    }

    public function getMethod($method)
    {
        $array = explode('::', $method);
        return $array[1];
    }

    public function getTestData($characterType)
    {
        switch ($characterType) {
            case '半角英数1':
                $master = static::$string011;
                break;
            case '半角英数2':
                $master = static::$string012;
                break;
            case '記号1':
                $master = static::$string021;
                break;
            case '記号2':
                $master = static::$string022;
                break;
            case '記号3':
                $master = static::$string023;
                break;
            case '英数字':
                $master = static::$string031;
                break;
            case 'ひらがな1':
                $master = static::$string041;
                break;
            case 'ひらがな2':
                $master = static::$string042;
                break;
            case 'カタカナ1':
                $master = static::$string051;
                break;
            case 'カタカナ2':
                $master = static::$string052;
                break;
            case 'ギリシャ・ロシア文字1':
                $master = static::$string061;
                break;
            case 'ギリシャ・ロシア文字2':
                $master = static::$string062;
                break;
            case 'ギリシャ・ロシア文字3':
                $master = static::$string063;
                break;
            case '罫線素片／囲み英数字／アラビア数字／単位記号1':
                $master = static::$string071;
                break;
            case '罫線素片／囲み英数字／アラビア数字／単位記号2':
                $master = static::$string072;
                break;
            case '罫線素片／囲み英数字／アラビア数字／単位記号3':
                $master = static::$string073;
                break;
            case '省略文字／囲み文字／年号／数学記号':
                $master = static::$string081;
                break;
            case '漢字1（一部抜粋）1':
                $master = static::$string091;
                break;
            case '漢字1（一部抜粋）2':
                $master = static::$string092;
                break;
            case '漢字1（一部抜粋）3':
                $master = static::$string093;
                break;
            case '漢字2（一部抜粋）1':
                $master = static::$string101;
                break;
            case '漢字2（一部抜粋）2':
                $master = static::$string102;
                break;
            case '漢字2（一部抜粋）3':
                $master = static::$string103;
                break;
            case 'チャッコメン禁則文字':
                $master = static::$string103;
                break;
        }
        $chunks = array_chunk($master, 5);
        $attributes = $this->attributes;
        $target = $this->getTarget();
        $ret = [];

        foreach ($chunks as $chunk) {
            $inputs = [];
            foreach ($attributes as $column => $value) {
                $inputs[$column] = $value;
                if (in_array($column, $target, true) === true) {
                    $inputs[$column] = implode('', $chunk);
                }
            }
            $ret[] = [$inputs, 200];
        }
        return $ret;
    }

    /**
     * テストデータと期待値
     */
    public function for半角英数1()
    {
        $method = $this->getMethod(__METHOD__);
        $method = preg_replace('/^for/', '', $method);
        return $this->getTestData($method);
    }
    public function for半角英数2()
    {
        $method = $this->getMethod(__METHOD__);
        $method = preg_replace('/^for/', '', $method);
        return $this->getTestData($method);
    }
    public function for記号1()
    {
        $method = $this->getMethod(__METHOD__);
        $method = preg_replace('/^for/', '', $method);
        return $this->getTestData($method);
    }
    public function for記号2()
    {
        $method = $this->getMethod(__METHOD__);
        $method = preg_replace('/^for/', '', $method);
        return $this->getTestData($method);
    }
    public function for記号3()
    {
        $method = $this->getMethod(__METHOD__);
        $method = preg_replace('/^for/', '', $method);
        return $this->getTestData($method);
    }
    public function for英数字()
    {
        $method = $this->getMethod(__METHOD__);
        $method = preg_replace('/^for/', '', $method);
        return $this->getTestData($method);
    }
    public function forひらがな1()
    {
        $method = $this->getMethod(__METHOD__);
        $method = preg_replace('/^for/', '', $method);
        return $this->getTestData($method);
    }
    public function forひらがな2()
    {
        $method = $this->getMethod(__METHOD__);
        $method = preg_replace('/^for/', '', $method);
        return $this->getTestData($method);
    }
    public function forカタカナ1()
    {
        $method = $this->getMethod(__METHOD__);
        $method = preg_replace('/^for/', '', $method);
        return $this->getTestData($method);
    }
    public function forカタカナ2()
    {
        $method = $this->getMethod(__METHOD__);
        $method = preg_replace('/^for/', '', $method);
        return $this->getTestData($method);
    }
    public function forギリシャ・ロシア文字1()
    {
        $method = $this->getMethod(__METHOD__);
        $method = preg_replace('/^for/', '', $method);
        return $this->getTestData($method);
    }
    public function forギリシャ・ロシア文字2()
    {
        $method = $this->getMethod(__METHOD__);
        $method = preg_replace('/^for/', '', $method);
        return $this->getTestData($method);
    }
    public function forギリシャ・ロシア文字3()
    {
        $method = $this->getMethod(__METHOD__);
        $method = preg_replace('/^for/', '', $method);
        return $this->getTestData($method);
    }
    public function for罫線素片／囲み英数字／アラビア数字／単位記号1()
    {
        $method = $this->getMethod(__METHOD__);
        $method = preg_replace('/^for/', '', $method);
        return $this->getTestData($method);
    }
    public function for罫線素片／囲み英数字／アラビア数字／単位記号2()
    {
        $method = $this->getMethod(__METHOD__);
        $method = preg_replace('/^for/', '', $method);
        return $this->getTestData($method);
    }
    public function for罫線素片／囲み英数字／アラビア数字／単位記号3()
    {
        $method = $this->getMethod(__METHOD__);
        $method = preg_replace('/^for/', '', $method);
        return $this->getTestData($method);
    }
    public function for省略文字／囲み文字／年号／数学記号()
    {
        $method = $this->getMethod(__METHOD__);
        $method = preg_replace('/^for/', '', $method);
        return $this->getTestData($method);
    }
    public function for漢字1（一部抜粋）1()
    {
        $method = $this->getMethod(__METHOD__);
        $method = preg_replace('/^for/', '', $method);
        return $this->getTestData($method);
    }
    public function for漢字1（一部抜粋）2()
    {
        $method = $this->getMethod(__METHOD__);
        $method = preg_replace('/^for/', '', $method);
        return $this->getTestData($method);
    }
    public function for漢字1（一部抜粋）3()
    {
        $method = $this->getMethod(__METHOD__);
        $method = preg_replace('/^for/', '', $method);
        return $this->getTestData($method);
    }
    public function for漢字2（一部抜粋）1()
    {
        $method = $this->getMethod(__METHOD__);
        $method = preg_replace('/^for/', '', $method);
        return $this->getTestData($method);
    }
    public function for漢字2（一部抜粋）2()
    {
        $method = $this->getMethod(__METHOD__);
        $method = preg_replace('/^for/', '', $method);
        return $this->getTestData($method);
    }
    public function for漢字2（一部抜粋）3()
    {
        $method = $this->getMethod(__METHOD__);
        $method = preg_replace('/^for/', '', $method);
        return $this->getTestData($method);
    }
    public function forチャッコメン禁則文字()
    {
        $method = $this->getMethod(__METHOD__);
        $method = preg_replace('/^for/', '', $method);
        return $this->getTestData($method);
    }

    public function seeOrionResponse(array $inputs, $status)
    {
        $send = $this->urlPrefix. $this->getUnitName();
        if (is_numeric($this->targetId) === true) {
            $send .= '/'. $this->targetId;
        }
        $method = strtolower($this->getHttpMethod($this->actionMethod));
        $this->$method($send, $inputs);
        if ($status === 200) {
            $expect = $this->getExcludedArray($inputs, static::$unset_columns);
            $this->seeJson($expect);
            $this->seeStatusCode(200);
        } else {
            $expect = $this->getExcludedArray($inputs, static::$unset_columns);
            $this->seeJson($expect);
            $this->seeStatusCode(422);
        }
    }

    public function cleansingData()
    {
        $data = $this->response->getData(true);
        $send = $this->urlPrefix. $this->getUnitName();
        if (is_numeric($data['id']) === true) {
            $send .= '/'. $data['id'];
        }
        $this->delete($send);
    }

    /**
     * @test
     * @group character_type
     */
    public function 半角英数1()
    {
        $method = $this->getMethod(__METHOD__);
        $provider = 'for'. $method;
        $tests = $this->$provider();
        foreach ($tests as $test) {
            $inputs = $test[0];
            $status = $test[1];
            $this->seeOrionResponse($inputs, $status);
            $this->cleansingData();
        }
    }

    /**
     * @test
     * @group character_type
     */
    public function 半角英数2()
    {
        $method = $this->getMethod(__METHOD__);
        $provider = 'for'. $method;
        $tests = $this->$provider();
        foreach ($tests as $test) {
            $inputs = $test[0];
            $status = $test[1];
            $this->seeOrionResponse($inputs, $status);
            $this->cleansingData();
        }
    }

    /**
     * @test
     * @group character_type
     */
    public function 英数字()
    {
        $method = $this->getMethod(__METHOD__);
        $provider = 'for'. $method;
        $tests = $this->$provider();
        foreach ($tests as $test) {
            $inputs = $test[0];
            $status = $test[1];
            $this->seeOrionResponse($inputs, $status);
            $this->cleansingData();
        }
    }

    /**
     * @test
     * @group character_type
     */
    public function ひらがな1()
    {
        $method = $this->getMethod(__METHOD__);
        $provider = 'for'. $method;
        $tests = $this->$provider();
        foreach ($tests as $test) {
            $inputs = $test[0];
            $status = $test[1];
            $this->seeOrionResponse($inputs, $status);
            $this->cleansingData();
        }
    }

    /**
     * @test
     * @group character_type
     */
    public function ひらがな2()
    {
        $method = $this->getMethod(__METHOD__);
        $provider = 'for'. $method;
        $tests = $this->$provider();
        foreach ($tests as $test) {
            $inputs = $test[0];
            $status = $test[1];
            $this->seeOrionResponse($inputs, $status);
            $this->cleansingData();
        }
    }

    /**
     * @test
     * @group character_type
     */
    public function カタカナ1()
    {
        $method = $this->getMethod(__METHOD__);
        $provider = 'for'. $method;
        $tests = $this->$provider();
        foreach ($tests as $test) {
            $inputs = $test[0];
            $status = $test[1];
            $this->seeOrionResponse($inputs, $status);
            $this->cleansingData();
        }
    }

    /**
     * @test
     * @group character_type
     */
    public function カタカナ2()
    {
        $method = $this->getMethod(__METHOD__);
        $provider = 'for'. $method;
        $tests = $this->$provider();
        foreach ($tests as $test) {
            $inputs = $test[0];
            $status = $test[1];
            $this->seeOrionResponse($inputs, $status);
            $this->cleansingData();
        }
    }

    /**
     * @test
     * @group character_type
     */
    public function ギリシャ・ロシア文字1()
    {
        $method = $this->getMethod(__METHOD__);
        $provider = 'for'. $method;
        $tests = $this->$provider();
        foreach ($tests as $test) {
            $inputs = $test[0];
            $status = $test[1];
            $this->seeOrionResponse($inputs, $status);
            $this->cleansingData();
        }
    }

    /**
     * @test
     * @group character_type
     */
    public function ギリシャ・ロシア文字2()
    {
        $method = $this->getMethod(__METHOD__);
        $provider = 'for'. $method;
        $tests = $this->$provider();
        foreach ($tests as $test) {
            $inputs = $test[0];
            $status = $test[1];
            $this->seeOrionResponse($inputs, $status);
            $this->cleansingData();
        }
    }

    /**
     * @test
     * @group character_type
     */
    public function ギリシャ・ロシア文字3()
    {
        $method = $this->getMethod(__METHOD__);
        $provider = 'for'. $method;
        $tests = $this->$provider();
        foreach ($tests as $test) {
            $inputs = $test[0];
            $status = $test[1];
            $this->seeOrionResponse($inputs, $status);
            $this->cleansingData();
        }
    }

    /**
     * @test
     * @group character_type
     */
    public function 罫線素片／囲み英数字／アラビア数字／単位記号1()
    {
        $method = $this->getMethod(__METHOD__);
        $provider = 'for'. $method;
        $tests = $this->$provider();
        foreach ($tests as $test) {
            $inputs = $test[0];
            $status = $test[1];
            $this->seeOrionResponse($inputs, $status);
            $this->cleansingData();
        }
    }

    /**
     * @test
     * @group character_type
     */
    public function 罫線素片／囲み英数字／アラビア数字／単位記号2()
    {
        $method = $this->getMethod(__METHOD__);
        $provider = 'for'. $method;
        $tests = $this->$provider();
        foreach ($tests as $test) {
            $inputs = $test[0];
            $status = $test[1];
            $this->seeOrionResponse($inputs, $status);
            $this->cleansingData();
        }
    }

    /**
     * @test
     * @group character_type
     */
    public function 罫線素片／囲み英数字／アラビア数字／単位記号3()
    {
        $method = $this->getMethod(__METHOD__);
        $provider = 'for'. $method;
        $tests = $this->$provider();
        foreach ($tests as $test) {
            $inputs = $test[0];
            $status = $test[1];
            $this->seeOrionResponse($inputs, $status);
            $this->cleansingData();
        }
    }

    /**
     * @test
     * @group character_type
     */
    public function 省略文字／囲み文字／年号／数学記号()
    {
        $method = $this->getMethod(__METHOD__);
        $provider = 'for'. $method;
        $tests = $this->$provider();
        foreach ($tests as $test) {
            $inputs = $test[0];
            $status = $test[1];
            $this->seeOrionResponse($inputs, $status);
            $this->cleansingData();
        }
    }

    /**
     * @test
     * @group character_type
     */
    public function 漢字1（一部抜粋）1()
    {
        $method = $this->getMethod(__METHOD__);
        $provider = 'for'. $method;
        $tests = $this->$provider();
        foreach ($tests as $test) {
            $inputs = $test[0];
            $status = $test[1];
            $this->seeOrionResponse($inputs, $status);
            $this->cleansingData();
        }
    }

    /**
     * @test
     * @group character_type
     */
    public function 漢字1（一部抜粋）2()
    {
        $method = $this->getMethod(__METHOD__);
        $provider = 'for'. $method;
        $tests = $this->$provider();
        foreach ($tests as $test) {
            $inputs = $test[0];
            $status = $test[1];
            $this->seeOrionResponse($inputs, $status);
            $this->cleansingData();
        }
    }

    /**
     * @test
     * @group character_type
     */
    public function 漢字1（一部抜粋）3()
    {
        $method = $this->getMethod(__METHOD__);
        $provider = 'for'. $method;
        $tests = $this->$provider();
        foreach ($tests as $test) {
            $inputs = $test[0];
            $status = $test[1];
            $this->seeOrionResponse($inputs, $status);
            $this->cleansingData();
        }
    }

    /**
     * @test
     * @group character_type
     */
    public function 漢字2（一部抜粋）1()
    {
        $method = $this->getMethod(__METHOD__);
        $provider = 'for'. $method;
        $tests = $this->$provider();
        foreach ($tests as $test) {
            $inputs = $test[0];
            $status = $test[1];
            $this->seeOrionResponse($inputs, $status);
            $this->cleansingData();
        }
    }

    /**
     * @test
     * @group character_type
     */
    public function 漢字2（一部抜粋）2()
    {
        $method = $this->getMethod(__METHOD__);
        $provider = 'for'. $method;
        $tests = $this->$provider();
        foreach ($tests as $test) {
            $inputs = $test[0];
            $status = $test[1];
            $this->seeOrionResponse($inputs, $status);
            $this->cleansingData();
        }
    }

    /**
     * @test
     * @group character_type
     */
    public function 漢字2（一部抜粋）3()
    {
        $method = $this->getMethod(__METHOD__);
        $provider = 'for'. $method;
        $tests = $this->$provider();
        foreach ($tests as $test) {
            $inputs = $test[0];
            $status = $test[1];
            $this->seeOrionResponse($inputs, $status);
            $this->cleansingData();
        }
    }

    /**
     * @test
     * @group character_type
     */
    public function チャッコメン禁則文字()
    {
        $method = $this->getMethod(__METHOD__);
        $provider = 'for'. $method;
        $tests = $this->$provider();
        foreach ($tests as $test) {
            $inputs = $test[0];
            $status = $test[1];
            $this->seeOrionResponse($inputs, $status);
            $this->cleansingData();
        }
    }
}
