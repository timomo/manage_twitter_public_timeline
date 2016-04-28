<?php

use core\Models\CoreUser;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;

use Illuminate\Support\Arr;

use Illuminate\Http\Request;

abstract class AbstractApiCommonControllerTest extends TestCase
{
    use DatabaseTransactions;

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

        /*
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
        */

        $actual = json_encode(Arr::sortRecursive($c), true);
        $expect = json_encode(Arr::sortRecursive($e), true);

        // $this->assertSame($c, $e);
        $this->assertEquals($expect, $actual);
    }

    protected function assertContentList($expected)
    {
        list($url, $seeder, $model) = $this->getKlass();
        $response = $this->call('GET', '/api/v1/'. $url);
        $this->assertEquals(200, $response->getStatusCode());

        $content = json_decode($response->getContent(), true);

        $c = array_map(array($this, 'getUnsetColumnsArray'), $content);
        $d = array_map(array($this, 'getUnsetColumnsArray'), $expected);

        $e =  Arr::sortRecursive($c);
        $f =  Arr::sortRecursive($d);

        /*
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
        */

        /*
        foreach ($c as $i => $tmp) {
            $this->assertSame($tmp, $e[$i]);
        }
        */

        $actual = json_encode(Arr::sortRecursive($c), true);
        $expect = json_encode(Arr::sortRecursive($e), true);

        // $this->assertSame($c, $e);
        $this->assertEquals($expect, $actual);
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

    protected function resetUserRole()
    {
        $role = 'core\Models\CoreUserRole';
        foreach ($role::all() as $data) {
            $data->forceDelete();
        }
    }

    protected function setUserRole($permissions)
    {
        list($url, $seeder, $model) = $this->getKlass();
        $userRole = 'core\Models\CoreUserRole';
        $role = 'core\Models\CoreRole';
        $user = $this->app['auth']->getUser();
        $newRole = new $role;
        $newRole->role_name = 'test';
        $newRole->role_comment = 'test';
        $newRole->permission = $permissions;
        $newRole->save();
        $newUserRole = new $userRole;
        $newUserRole->user_id = $user->id;
        $newUserRole->role_id = $newRole->id;
        $newUserRole->save();
    }

    protected function getPluginName($model)
    {
        $tmp = explode('\\', $model);
        return strtolower($tmp[count($tmp) - 1]);
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
}
