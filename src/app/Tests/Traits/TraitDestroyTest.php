<?php

use Illuminate\Support\Arr;

trait TraitDestroyTest
{
    /**
     * 想定データ送信
     * @test
     * @group append
     * @group normal
     * @group destroy
     * @return void
     */
    public function destroy002()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $user = $model::find($this->targetId);
        $this->assertInstanceOf($model, $user);
        $this->delete('/api/v1/'. $url. '/'. $user->id);
        $this->seeStatusCode(200);
        $this->seeJson();
        $user = $model::find($this->targetId);
        $this->assertNull($user);
    }

    /**
     * 存在しないID
     * @test
     * @group append
     * @group semi_normal
     * @group destroy
     * @return void
     */
    public function destroy003()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $this->get('/api/v1/'. $url);
        $this->seeStatusCode(200);
        $this->seeJson();
        $list = $this->response->getData(true);
        $this->assertTrue(is_array($list));

        $max = 0;
        foreach ($list as $data) {
            if ($max < $data['id']) {
                $max = $data['id'];
            }
        }
        $max += 1;
        $this->delete('/api/v1/'. $url. '/'. $max);
        $this->seeStatusCode(404);
        $this->seeJson();
    }

    /**
     * 権限チェック（一覧×、登録×、編集×、削除×、出力×）
     * @test
     * @group append
     * @group normal
     * @group destroy
     * @return void
     */
    public function destroy004()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $this->resetUserRole();
        try {
            $this->delete('/api/v1/'. $url. '/'. $this->targetId);
        } catch (Symfony\Component\HttpKernel\Exception\HttpException $e) {
            $this->assertEquals(403, $e->getStatusCode());
        }
    }

    /**
     * 権限チェック（一覧○、登録×、編集×、削除×、出力×）
     * @test
     * @group append
     * @group normal
     * @group destroy
     * @return void
     */
    public function destroy005()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $this->resetUserRole();
        $permissions = [
            'get_'. $url => 1,
        ];
        $this->setUserRole($permissions);
        try {
            $this->delete('/api/v1/'. $url. '/'. $this->targetId);
        } catch (Symfony\Component\HttpKernel\Exception\HttpException $e) {
            $this->assertEquals(403, $e->getStatusCode());
        }
    }

    /**
     * 権限チェック（一覧○、登録○、編集×、削除×、出力×）
     * @test
     * @group append
     * @group normal
     * @group destroy
     * @return void
     */
    public function destroy006()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $this->resetUserRole();
        $permissions = [
            'get_'. $url => 1,
            'add_'. $url => 1,
        ];
        $this->setUserRole($permissions);
        try {
            $this->delete('/api/v1/'. $url. '/'. $this->targetId);
        } catch (Symfony\Component\HttpKernel\Exception\HttpException $e) {
            $this->assertEquals(403, $e->getStatusCode());
        }
    }

    /**
     * 権限チェック（一覧○、登録○、編集○、削除×、出力×）
     * @test
     * @group append
     * @group normal
     * @group destroy
     * @return void
     */
    public function destroy007()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $this->resetUserRole();
        $permissions = [
            'get_'. $url => 1,
            'add_'. $url => 1,
            'edit_'. $url => 1,
        ];
        $this->setUserRole($permissions);
        try {
            $this->delete('/api/v1/'. $url. '/'. $this->targetId);
        } catch (Symfony\Component\HttpKernel\Exception\HttpException $e) {
            $this->assertEquals(403, $e->getStatusCode());
        }
    }

    /**
     * 権限チェック（一覧○、登録○、編集○、削除×、出力○）
     * @test
     * @group append
     * @group normal
     * @group destroy
     * @return void
     */
    public function destroy008()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $this->resetUserRole();
        $permissions = [
            'get_'. $url => 1,
            'add_'. $url => 1,
            'edit_'. $url => 1,
            'csv_'. $url => 1,
        ];
        $this->setUserRole($permissions);
        try {
            $this->delete('/api/v1/'. $url. '/'. $this->targetId);
        } catch (Symfony\Component\HttpKernel\Exception\HttpException $e) {
            $this->assertEquals(403, $e->getStatusCode());
        }
    }

    /**
     * DB停止
     * @group append
     * @group failure
     * @group destroy
     * @return void
     */
    public function destroy009()
    {
        list($url, $seeder, $model) = $this->getKlass();
        try {
            Config::set('database.connections.invalid', [
                'driver' => 'mysql',
                'host' => 'localhost',
                'database' => 'invalid',
            ]);
            Config::set('database.default', 'invalid');
            $this->delete('/api/v1/'. $url. '/'. $this->targetId);
        } catch (Symfony\Component\HttpKernel\Exception\HttpException $e) {
            $this->assertEquals(403, $e->getStatusCode());
        }
    }

    /**
     * CSRFヘッダなし
     * @test
     * @group append
     * @group semi_normal
     * @group destroy
     * @return void
     */
    public function destroy010()
    {
        list($url, $seeder, $model) = $this->getKlass();

        Config::set('api.allow_ips', []);
        $headers = [];

        try {
            $this->delete('/api/v1/'. $url. '/'. $this->targetId, $headers);
        } catch (Symfony\Component\HttpKernel\Exception\HttpException $e) {
            $this->assertEquals(403, $e->getStatusCode());
        }
        $user = $model::find($this->targetId);
        $this->assertInstanceOf($model, $user);
    }

    /**
     * CSRFのヘッダ情報間違い
     * @test
     * @group append
     * @group semi_normal
     * @group destroy
     * @return void
     */
    public function destroy013()
    {
        list($url, $seeder, $model) = $this->getKlass();

        Config::set('api.allow_ips', []);
        $headers = ['X-XSRF-TOKEN' => 'invalid'];

        try {
            $this->delete('/api/v1/'. $url. '/'. $this->targetId, $headers);
        } catch (Symfony\Component\HttpKernel\Exception\HttpException $e) {
            $this->assertEquals(403, $e->getStatusCode());
        }
        $user = $model::find($this->targetId);
        $this->assertInstanceOf($model, $user);
    }

    /**
     * メンテナンスモード
     * @test
     * @group append
     * @group normal
     * @group destroy
     * @return void
     */
    public function destroy015()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $plugin = $this->getPluginName($model);
        $expected = $this->getSortedByKey($seeder::data());
        Config::set('maintenance.'. $plugin. '.access', false);
        Config::set('maintenance.'. $plugin. '.message', 'test');
        $this->delete('/api/v1/'. $url. '/'. $this->targetId);
        $this->seeStatusCode(503);
        $this->seeJson();
        $user = $model::find($this->targetId);
        $this->assertInstanceOf($model, $user);
    }
}
