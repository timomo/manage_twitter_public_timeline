<?php

use core\Models\CoreUser;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;

use Illuminate\Support\Arr;

abstract class AbstractApiControllerTest extends TestCase
{
    public static $unset_columns = [
        "id", "password",
        "created_at", "updated_at", "deleted_at",
        "created_user_id", "updated_user_id", "deleted_user_id",
        "current_sign_in_at", "current_sign_in_ip",
        "last_sign_in_at", "last_sign_in_ip"
    ];

    public function setUp()
    {
        parent::setUp();

        // @see http://laravel.com/docs/5.0/testing#helper-methods
        Model::unguard();

        $user = new CoreUser(['id' => 1, 'account' => 'administrator@kccs.co.jp', 'lang' => 'ja']);
        $this->be($user);

        Model::unguard(false);
    }

    /**
     * A basic functional test example.
     *
     * @group normal
     * @return void
     */
    public function testIndexWithSeeder()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $expected = $this->getSortedByKey($seeder::data());
        $this->assertContentList($expected);
    }

    public function noTestHaveNoAuthorityWhenAccessToIndex()
    {
        Model::unguard();
        $user = new CoreUser(['id'=>2, 'account'=>'hideo-takahashi@kccs.co.jp', 'lang'=>'ja']);
        $this->be($user);
        Model::unguard(false);
        list($url, $seeder, $model) = $this->getKlass();
        $this->assertForbidden();
    }

    public function testCreateWithSeeder()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $expected = $seeder::data();
        $params = $expected[0];
        // @see http://davejustdave.com/2015/02/08/laravel-5-unit-testing-with-csrf-protection/
        Session::start();
        $params['_token'] = Session::token();
        $model = new $model();
        $params[$model->getKeyName()] = "1";
        $create_expected = $expected[0];
        $create_expected[$model->getKeyName()] = "1";
        if (isset($params['account']))
        {
            $params['account'] .= "1";
            $create_expected['account'] .= "1";
        }
        if (isset($params['code1']))
        {
            $params['code1'] += 10;
            $create_expected['code1'] += 10;
        }
        $response = $this->call('POST', '/api/v1/'. $url, $params);
        $this->assertContentRecord($response, $create_expected);

        sleep(3);
        $expected = array_merge($expected, array($create_expected));
        if($model->getKeyName() !== 'id') {
            $expected = $this->getSortedByKey($expected);
        }
        $this->assertContentList($expected);
    }

    public function testShowWithSeeder()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $expected = $seeder::data();
        $response = $this->call('GET', '/api/v1/'. $url. '/'. '1');
        $expected = $expected[0];
        $model = new $model();
        if($model->getKeyName() !== 'id') {
            $expected[$model->getKeyName()] = "1";
        }
        $this->assertContentRecord($response, $expected);
    }

    public function testUpdateWithSeeder()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $expected = $seeder::data();
        $params = $expected[1];
        Session::start();
        $params['_token'] = Session::token();
        $model = new $model();
        $params[$model->getKeyName()] = "2";
        $update_expected = $expected[1];
        $update_expected[$model->getKeyName()] = "2";
        if (isset($params['account']))
        {
            $params['account'] .= "2";
            $update_expected['account'] .= "2";
            $expected[0]['account'] .= "1";
        }
        if (isset($params['code1']))
        {
            $params['code1'] += 20;
            $update_expected['code1'] += 20;
            $expected[0]['code1'] += 10;
        }
        $response = $this->call('PUT', '/api/v1/'. $url. '/'. '1', $params);
        $this->assertContentRecord($response, $update_expected);

        sleep(3);
        $expected = array_merge(array($update_expected), array_slice($expected, 1), array($expected[0]));
        if($model->getKeyName() !== 'id') {
            $expected = $this->getSortedByKey($expected);
        }
        $this->assertContentList($expected);
    }

    public function testDestroyWithSeeder()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $expected = $seeder::data();
        Session::start();
        $params = $expected[1];
        $params['_token'] = Session::token();
        $model = new $model();
        $params[$model->getKeyName()] = "2";
        $delete_expected = $expected[1];
        $delete_expected[$model->getKeyName()] = "2";
        if (isset($expected[0]['account']))
        {
            $expected[1]['account'] .= "2";
            $expected[0]['account'] .= "1";
        }
        if (isset($expected[0]['code1']))
        {
            $expected[1]['code1'] += 20;
            $expected[0]['code1'] += 10;
        }
        $response = $this->call('DELETE', '/api/v1/'. $url. '/'. '2', $params);
        $this->assertContentRecord($response, $delete_expected);

        sleep(3);
        $expected = array_merge(array_slice($expected, 1), array($expected[0]));
        $this->assertContentList($expected);
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
}
